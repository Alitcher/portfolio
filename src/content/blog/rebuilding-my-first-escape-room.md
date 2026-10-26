---
title: Rebuilding My First-Year Escape Room in OpenGL
date: 2026-10-25
readingMinutes: 5
summary: My first university game project did not go well. Years later I am building it again, from scratch, in C++ and OpenGL, and dressed up like Windows 95.
tags: [graphics, opengl, gamedev, personal]
---

# Rebuilding My First-Year Escape Room in OpenGL

This project started a long time ago, in my first year as a game design
student.

## The first try

One of our first university projects was an escape room game. I was excited
about the idea, but I did not know how to code yet. I could imagine the
puzzles in my head, but I could not build them myself.

I was also not good at talking. I found it hard to explain my ideas to my
team, and even harder to ask for help when I was stuck. So I stayed quiet,
the problems got bigger, and in the end everything went bad. The game we
handed in was nothing like the one I had imagined.

We made that first version in Unity. Here is the video of it,
"TheWallerFamily: First year student team project using Unity":

https://www.youtube.com/watch?v=uh4arCVpzZw

For a long time it was just a project I did not want to think about.

## Why try again

Since then I have learned a lot. I have written code in C#, C++ and
TypeScript, built things in Unity and Unreal, and worked on real projects with
other people. I have also become much better at explaining what I am doing.

So I wanted to go back to that escape room and do it properly this time. Not
as a quick game in an existing engine like Unity, but by building the engine
myself in C++ and OpenGL. It is a way to show myself how far I have come.

## What it is now

The new version is a small **escape-room creation platform**:

- A room is a JSON file. Every object, puzzle and link between them is data.
- The engine loads any room file and lets you play it in first person.
- A built-in level editor lets you build rooms without touching the JSON:
  place objects, move them with 3D handles, wire up the puzzles and press F5
  to play.

The sample room is a cosplay convention green room. You are locked in before
the con starts. Talk to Mika, roll three dice to open a drawer, use the key
inside on the cabinet, read the note for the door code, and escape to the con
floor.

You can read more about how it works on the
[Escape Room Engine](#/projects/opengl-renderer) project page.

## Why Windows 95

I miss my childhood. Some of my happiest memories are of sitting in front of
an old computer with gray windows, navy title bars and a teal desktop.

So the level editor looks like Windows 95: gray panels with raised buttons,
white sunken lists, dotted lines in the object tree and a status bar along the
bottom. It is the same style as this website. Building a game engine is hard
work, and it makes me smile every time I open it.

## What I did differently this time

- **Small steps that always run.** First a window, then one triangle, then a
  cube, a camera, a room. I never had a long stretch where nothing worked.
- **Writing things down.** I keep a development log with every decision and
  why I made it. It also makes it much easier to explain the project to
  others, which was exactly what I could not do the first time.
- **Puzzles as data.** The game rules do not know about any specific room, so
  new puzzles do not mean new code.

## What is next

The objects are still simple colored boxes. Next I want real 3D models,
textures, better lighting and shadow mapping. The first-year me would not
believe any of this exists, and that is the best part.
