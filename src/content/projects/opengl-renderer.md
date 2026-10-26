## Overview

A 3D game engine I am writing from scratch in modern C++ and OpenGL, out of my
interest in real-time graphics and how engines work under the hood.

It is a small **escape-room creation platform**. A room is built in the
engine's own level editor and saved as one JSON file. The engine then loads
that file and plays it, so it is not one game but a tool for making many.

The sample level is a cosplay convention green room: you are locked in before
the con, and you have to solve a chain of puzzles to reach the stage door.

## The Tech Stack

- **C++17 + OpenGL 4.6** - the engine and renderer, GLSL shaders
- **GLFW + GLEW** - window, input and OpenGL loading
- **GLM** - vectors, matrices and transforms
- **Dear ImGui + ImGuizmo** - game UI and the level editor with 3D move / rotate / scale handles
- **nlohmann/json** - reading and writing level files
- **CMake + vcpkg** - build and libraries

## From JSON to a Playable Room

1. **Load the level** - The JSON file lists every object: its model, position,
   parent and puzzle settings. Objects link to each other by id, so the puzzle
   logic is data, not code.
2. **Build the scene** - Each object gets a world transform through its parent
   chain, then it is drawn with lit 3D geometry and a first-person camera.
3. **Play** - Walls block the player, a ray from the camera finds what is
   under the crosshair, and the game rules handle pickups, locked containers,
   notes, keypads, NPCs who talk and dice whose total is a code.

## The Puzzle in the Sample Room

1. Talk to Mika, a fellow cosplayer, for a hint.
2. Roll three dice and type their total into the drawer's lock.
3. Take the prop key from the drawer and hold it to unlock the cabinet.
4. Read the note inside for the stage door code.
5. Enter the code on the keypad and escape to the con floor.

## The Level Editor

The editor is built into the same program; F5 switches between editing and
playing, so a room can be tested the moment it changes.

- **Unity-style workflow** - Hierarchy, Scene view, Inspector and Project
  panels; orbit, pan, zoom and fly navigation; box select.
- **Gizmos** - move, rotate and scale objects in 3D, with snapping.
- **Parent / child objects** - a drawer carries its lock and the key hidden
  inside it.
- **Drag and drop** - drop 3D models into the room, or drop 2D items onto a
  drawer, a door or an NPC to put them inside, use them as a key or give them
  as a gift.
- **Safe editing** - named undo / redo with a history window, copy and paste,
  and a problems list that warns about broken puzzles before playtesting.
- **Windows 95 look** - the editor UI matches the retro style of this site.

## Lessons Learned

- Keeping game rules separate from rendering, so the puzzle logic can be tested without a window.
- Designing a data-driven level format that is easy to read and edit by hand.
- Turning a gizmo's matrix back into position, rotation and scale numbers that stay stable in the Inspector.
- Parent / child transforms, and keeping an object in place when it changes parent.
- Building editor tools: undo history, clipboard and drag and drop.

## What's Next

Real 3D models instead of placeholder boxes, textures, Phong lighting and
shadow mapping, then a Vulkan backend as a stretch goal.
