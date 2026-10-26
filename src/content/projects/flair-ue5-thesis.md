## Overview

**[UE5 Flair's Integration - UI, Shaders, and Image Algorithms for NPR](https://thesis.cs.ut.ee/e2fd9b74-f1f5-41cd-b7f4-854bbd75f3ce)** is my master's thesis in Computer Science at the University of Tartu (30 ECTS, defended in 2024), made for [Artineering](https://artineering.io/software/flair).

[Flair](https://artineering.io/software/flair) is [Artineering](https://artineering.io)'s real-time engine for non-photorealistic rendering (NPR): watercolor, toon, outlines and other hand-drawn looks in 3D. Until then it only lived inside Autodesk Maya. My job was to build the first version of [Flair](https://artineering.io/software/flair) for Unreal Engine 5, so that UE5 artists and developers get the same easy presets without needing Maya or writing shaders from scratch.

I was supervised by Ulrich Norbisrath (University of Tartu) and Santiago Montesdeoca (Artineering).

## Back Story

Unreal Engine is famous for photorealistic graphics, but it has very few NPR tools. When artists want a stylized look, they usually build it by hand: a Post Process Volume, custom HLSL, and long material blueprints. That is slow, and hard for anyone who is not a shader programmer.

[Flair](https://artineering.io/software/flair) in Maya solved this years ago with a simple shelf of art-directed tools, from global style presets down to per-material settings. I wanted to bring that same feeling to UE5, for a wider group of people: 3D artists, environment artists, technical artists and game developers.

## Research and Design

Before writing any code, I studied how both tools work:

- **[Flair](https://artineering.io/software/flair) in Maya** - I used it myself, first on a simple scene and then on the "Steamboat Willie" scene from [Artineering](https://artineering.io/software/flair), and broke down its levels of control (global, mid-level, mapped and proxy) and its MVC architecture.
- **UE5 workflows** - I followed community and Udemy tutorials for making UI in C++, and talked with UE5 developers on Discord.
- **User journeys** - I mapped the user journey of Flair Maya's version next to manual NPR creation in UE5.
- **Persona** - "Sonia", a technical artist moving from UE4 to UE5, guided what to keep and what to simplify.

## The Tech Stack

- **Shelf** - C++ with Slate widgets, a dockable shelf inside the UE5 editor (vertical, horizontal or floating)
- **Dialogs** - Python with Qt (PySide2), reusing and adapting the original [Flair](https://artineering.io/software/flair) dialogs
- **Engine bridge** - the UE5 Python API, through a new controller layer written only for UE5
- **Shaders** - HLSL in custom material expressions, ported from [Flair](https://artineering.io/software/flair)'s GLSL
- **Data** - Python dictionaries as the model, reading defaults from a UE5 Material Parameter Collection
- **Architecture** - Model-View-Controller, the same pattern as [Flair](https://artineering.io/software/flair) for Maya, so code can be shared between both

## How It Works

1. **Open the shelf** - Pick "Flair" from the Tools menu. The C++ shelf registers itself in the editor and opens the matching Qt dialog for each tool.
2. **Style Presets** - Choose a style (Blur, Cel, Sobel, Gaussian or Pixel). The plugin finds or creates the Post Process Volume and applies the post-processing material, replacing or inserting it as needed.
3. **Global Settings** - Tune the parameters of all active post-processing materials in one place, instead of opening each material instance in the Content Browser.
4. **Material Presets** - Select a mesh in the viewport and apply a stylized material to it.
5. **Material Attributes** - Adjust every material on the selected mesh from one dialog, with live updates in the viewport.

## Testing and Results

I ran five one-on-one usability sessions in the CGVR lab, following Jakob Nielsen's five-user method. The testers were generalist UE5 developers, an environment artist and a senior technical artist, with 1 to 10 years of UE5 experience. Each session was a blind test: they got tasks, but no instructions.

- **Everyone** could open the shelf, apply style presets and save a new preset without help, so the first steps are intuitive at every level.
- **Artists and juniors** could not build NPR by hand at all (Post Process Volume plus HLSL), but could apply and save NPR styles with the plugin. That is exactly who the plugin is for.
- **Senior users** could build NPR manually, and said they would use the plugin for good presets with access to the shader code.
- **Main issues** - hard-to-find documentation, the word "Global" confusing non-technical users, no clear feedback after saving a preset, and a risky Delete button.

## Poster

![UE5 Flair's Integration: UI, Shaders, and Image Algorithms for NPR - thesis poster, University of Tartu](./assets/posters/flair-ue5-thesis-poster.jpg)

[Open the poster as PDF](./assets/posters/flair-ue5-thesis-poster.pdf)

## Lessons Learned

- Research the users before the code: the user journeys showed me the real pain point (project setup), not the one I expected.
- Reusing a production-proven design's MVC and dialogs saves time, but the controller and data layer still had to be rebuilt for a new engine.
- Porting shaders from GLSL to HLSL taught me how differently two engines handle parameters, UVs and texture lookups.
- Blind usability tests with only five people already find most of the big problems.
