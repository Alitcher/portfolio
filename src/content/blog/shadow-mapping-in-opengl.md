---
title: Shadow Mapping in OpenGL
date: 2026-06-10
readingMinutes: 8
summary: A practical walkthrough of shadow mapping, from the depth pass to fixing acne and peter-panning.
tags: [graphics, opengl, rendering]
---

# Shadow Mapping in OpenGL

Shadow mapping is the workhorse of real-time shadows. The idea is simple; the details
are where it gets interesting.

## The two passes

1. **Depth pass** — render the scene from the light's point of view into a depth
   texture. This records, for every direction the light can see, the distance to the
   nearest surface.
2. **Lighting pass** — render from the camera. For each fragment, transform it into
   light space and compare its depth against the shadow map. Farther than the stored
   depth means it is in shadow.

## Fighting shadow acne

Self-shadowing artifacts come from depth precision. My go-to fixes:

- A small **depth bias**, ideally slope-scaled.
- **Front-face culling** during the depth pass.
- Percentage-closer filtering (**PCF**) to soften edges and hide the stair-stepping.

## Peter-panning

Too much bias and shadows detach from their casters. It is a balancing act — tune
bias against acne on your actual scene, not a toy one.

## Performance

Shadow map resolution dominates cost. Cascaded shadow maps give you crisp shadows up
close and cheap ones far away, which is essential for large outdoor scenes.
