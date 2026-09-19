---
title: 'Validation is the real model: Datathon 2026, from 230 to 77'
description: 'A regression competition where the most useful thing I built was not a model but a score: one that weighted errors the way the test set did.'
date: 2026-09-19
code: DTN
project: datathon-2026
tags: ['Python', 'scikit-learn', 'Stacking', 'Validation']
---

Datathon 2026 was a Kaggle regression task: predict a 0–100 "career success score" for 10,000 students from 45 columns of numbers, categories and a free-text mentor comment. The metric was mean squared error. Predicting the average for everyone scored **230.6**. My final stack reached **77.17** out-of-fold.

This note is about the part that made the rest possible: deciding which scores to believe.

## Two signals that disagreed

The leaderboard allowed only a few submissions, and its scores didn't line up with my first cross-validation numbers. When your offline number and your online number disagree, every decision becomes a guess, and you start tuning to noise.

So before building more models, I compared the training and test files column by column.

## The test set lived in a different time

One column explained most of it: `application_year`.

| Year | Train rows | Test rows |
|---|---:|---:|
| 2019 | 1,289 | 403 |
| 2022 | 1,293 | 881 |
| 2024 | 1,319 | 1,994 |
| 2025 | 1,191 | 2,197 |
| 2026 | 997 | 2,029 |

Training data was spread almost evenly over 2019–2026. The test set was heavily recent: **62% of it came from 2024–2026, against 35% of the training data**. The target moved over time as well. The average score was 77.9 in 2019 and 74.2 in 2026.

Random K-fold validation averages the error over years in the training proportions. The leaderboard averages it in the test proportions. A model that is good on old students and worse on recent ones looks fine offline and loses points online.

## A score that weights errors like the test set

I kept the random folds for training, but judged every model with a second number. I computed the error separately for each year, then weighted each year by its share of the test set:

```python
test_w = test['application_year'].value_counts(normalize=True).to_dict()

def lb_like(oof):
    per_year = (pd.DataFrame({'yr': year_train, 'e': (y - oof) ** 2})
                  .groupby('yr')['e'].mean())
    return sum(test_w.get(yr, 0) * per_year[yr] for yr in per_year.index)
```

It needs no extra submissions and uses nothing from the test set except how many rows each year has. From then on, every script printed both scores side by side, and the hyperparameter search (Optuna, 40 trials for LightGBM, 20 for CatBoost) optimised the year-weighted one.

## Features, without leaking the answer

With a score I could trust, the rest was steady work.

- **Numbers:** skill-group averages (technical, engineering, soft skills, interviews, profile), a count of missing fields, and one feature I liked: the score in the skill that matches the student's target role (backend score for a backend developer, SQL for a data analyst) and its gap from their average. Missing values were filled with the median *plus* a flag column, because whether a field was empty carried signal of its own.
- **Categories:** one-hot for linear models, and target encoding for trees. Target encoding is where competitions leak. If a row's own score helps encode its own category, validation looks better than reality. I used scikit-learn's `TargetEncoder`, which cross-fits internally, so each row is encoded without seeing itself.
- **Text:** word (1–2 grams) and character (2–5 grams) TF-IDF on the mentor comments, compressed to 120 dimensions with truncated SVD, plus simple counts of positive and negative Turkish phrases.

All predictions were clipped to 0–100, since the target can't leave that range and a squared error punishes every overshoot.

## Stacking: the team beats its best player

I trained different kinds of models on the same five folds, kept each one's out-of-fold predictions, and fit a Ridge regression on top of those predictions:

| Model | Out-of-fold MSE |
|---|---:|
| Extra Trees | 94.8 |
| MLP | 90.1 |
| Ridge | 85.9 |
| HistGradientBoosting, setting A | 82.9 |
| HistGradientBoosting, setting B | 82.5 |
| **Stack of the five, Ridge on top** | **78.25** |

The best single model scored 82.5; the stack of the same five scored 78.25. That only works because they make *different* mistakes. The linear model and the trees are wrong about different students, and the meta-model learns how much to trust each. Adding LightGBM, XGBoost and CatBoost brought the stack to 77.17.

The last version averaged every gradient-boosting model over three random seeds and added a CatBoost that reads the raw categories. The goal there was lower variance rather than a lower average: predictions that change less from run to run, which matters when the leaderboard is small and noisy.

## A dead end worth writing down

I tried BERTurk, a Turkish transformer, to embed the mentor comments. Needing a GPU was fine; not improving anything was not. A model using the text alone plateaued around an MSE of 148, and TF-IDF already captured that signal. I dropped it. Keeping one script per step, each with its measured score in the header, made that an easy call instead of a sunk-cost argument.

## What I took from it

- **Validation design is the real model.** Once my offline score behaved like the test set, choosing features, models and hyperparameters became ordinary engineering.
- **Look at the test set, not just the training set.** Finding the year shift needed no labels, only a `value_counts()` on both files.
- **Diversity beats a single strong model.** The stack improved on its best member by more than four points of MSE.
- **Write the score into the file.** Every script starts with the numbers it produced, so I can still tell which idea helped and which didn't.

All scripts are [on GitHub](https://github.com/omerdm34/datathon-2026). The full model log is in the [case study](/projects/datathon-2026/).
