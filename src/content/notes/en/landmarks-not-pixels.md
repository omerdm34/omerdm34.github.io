---
title: 'Landmarks, not pixels: sign-language letters on a phone'
description: 'Why I replaced a 9.5 MB image model with a 235 KB one that reads 63 numbers per frame, and the small rules that turn a flickering classifier into something people can type with.'
date: 2026-09-19
code: SBA
project: signbridge-ai
tags: ['Android', 'MediaPipe', 'TensorFlow Lite', 'On-device ML']
---

SignBridgeAI turns American Sign Language letters into text on an Android phone. The camera frame never leaves the device. This note is about the two decisions that made it work: what the model looks at, and what the app does with its answers.

## The first version looked at the wrong thing

My first model classified camera images directly: a frozen MobileNetV2 with a small head, trained on 128 × 128 images from the ASL Alphabet dataset. The exported TensorFlow Lite file was 9.5 MB for 28 classes. The bigger problem was what it looked at. An image model sees the whole frame, so the dataset's backgrounds, lighting and skin tones are all part of what it learns, and none of them are the letter.

A letter in fingerspelling is a hand shape. The background, the skin tone and the distance to the camera are noise. So I stopped giving the model pixels.

## 21 points instead of 16,384 pixels

Google's MediaPipe hand landmarker already solves the hard vision problem. It finds a hand and returns 21 three-dimensional points: the wrist, and four joints on each finger. I use those points as the input and throw the image away.

Raw landmarks still carry things I don't want. They depend on where the hand is in the frame and how close it is. Two lines remove both:

```kotlin
// Relative to the wrist: the hand can be anywhere in the frame.
val x = raw[i][0] - wristX
val y = raw[i][1] - wristY
val z = raw[i][2] - wristZ

// Divide by the largest coordinate: near and far hands look the same.
features[k] = x / maxAbs   // 21 points × (x, y, z) = 63 numbers
```

That gives 63 numbers per frame, all between −1 and 1. They say nothing about skin tone, background or lighting unless those break the landmark detection itself.

The same function runs in two places, in Python when I build the training set and in Kotlin inside the app. They have to match exactly. A different order or a forgotten scale step would not crash anything. The model would just quietly get worse. So the two versions follow the same steps in the same order: subtract the wrist, find the largest absolute value, divide.

## A model small enough not to matter

I ran the landmarker over up to 1,000 images per class. Where it found a hand, which happened 21,147 times, I saved the 63 numbers and the label. The classifier on top is deliberately boring. It's three dense layers (256 → 128 → 64) with batch normalisation and dropout, trained with early stopping on a stratified 80/20 split.

The exported model is **235 KB**, about 40 times smaller than the image model. On the phone, the heavier work is now MediaPipe's landmarker; the classifier on top is a few small matrix multiplications.

I haven't published an accuracy number. My test split comes from the same dataset as the training data, so it would flatter the model. An honest figure needs signs recorded by other people in other rooms, and that's the next thing I want to collect.

## A classifier is not a keyboard

A model that answers every frame produces a stream like `A A A S A A E E E`. Typing whatever it says gives nonsense. So the app sits between the model and the text box:

```kotlin
if (confidence >= 0.85f && label == lastLabel) stableCount++ else stableCount = 1

// Accept a letter after three steady frames, then wait for the hand to change.
if (stableCount >= 3 && (!waitingForRelease || label != lastAdded)) {
    append(label)
    lastAdded = label
    waitingForRelease = true
}
if (label == "NO_HAND") { waitingForRelease = false; lastAdded = "" }
```

Three rules come out of that:

- **Only confident letters.** Below 85% confidence nothing is typed.
- **Only steady letters.** The same answer has to hold for three frames in a row, which removes the one-frame flickers when a hand moves between shapes.
- **One pose, one letter.** After a letter is accepted, holding the same shape doesn't type it again. To write a double letter, you drop your hand out of frame and bring it back.

The confidence value also drives the hints on screen. Below 65% the app asks for better light or framing. Between 65% and 85% it says "almost there, hold it steady". The idea is that a user who knows *why* nothing is being typed can fix the input, instead of repeating the same sign and giving up.

## Left hands were read backwards

The training images are mostly right hands. A left-handed signer makes the same letter as a mirror image, which the model had rarely seen, so left hands were misread.

Retraining with mirrored copies would have worked. But MediaPipe already reports which hand it sees, so the fix was one branch in the normalisation step:

```kotlin
val x = if (isLeftHand) wristX - raw[i][0] else raw[i][0] - wristX
```

A left hand gets flipped into the geometry the model knows. No new data, no new model, and it runs identically for every frame.

## What I took from it

- **The representation mattered more than the model.** Moving from pixels to landmarks let a tiny network do the job, and made the model small enough that size stopped being a question.
- **Most bugs were in the interaction, not in the network.** Doubled letters, left hands and bad lighting were all handled outside the classifier.
- **Duplicated preprocessing is a contract.** When training code and app code must agree, keep the steps identical and in the same order, and treat any change to one as a change to both.

The model and training code are [on GitHub](https://github.com/omerdm34/signbridge-ai). The product side (translation, speech, the Play release) is in the [case study](/projects/signbridge-ai/).
