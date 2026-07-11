## Overview

A VR training simulation that lets operators rehearse factory floor layout,
machine operation and safety procedures before ever stepping onto a real line.
Built to run across tethered PCVR and standalone Quest headsets from a single
codebase.

## Lessons Learned

- Abstracting device input so one interaction layer serves every headset.
- Streaming large factory scenes with Addressables to fit memory budgets.
- Building repeatable, measurable training scenarios.
