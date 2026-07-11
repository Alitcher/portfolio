## Overview

A from-scratch real-time rendering engine written in modern C++ and OpenGL. It
implements a deferred pipeline with physically based shading, shadow mapping,
SSAO and bloom, and doubles as a testbed for graphics techniques.

## Lessons Learned

- Structuring a deferred G-buffer for extensibility.
- Debugging GPU state with RenderDoc as a daily habit.
- Balancing PBR correctness against real-time performance.
