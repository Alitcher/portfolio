\# Retro Portfolio Website Specification



\## Project Overview



Build a personal portfolio website that intentionally looks like it was created around \*\*1999–2003\*\*, while being powered by modern web technologies.



The goal is to surprise visitors:



\* First impression: "This looks like an old Windows XP website."

\* Second impression: "Wait... it has an AI assistant, interactive projects, and modern features."



The website should feel nostalgic but still professional.



\---



\# Technology Stack



\## Frontend



\* Vite

\* TypeScript

\* HTML

\* CSS



Do \*\*NOT\*\* use:



\* React

\* Vue

\* Angular

\* Tailwind CSS

\* Bootstrap



Use vanilla TypeScript and organize the code into reusable modules.



\---



\## Styling



Use only plain CSS.



Theme inspiration:



\* Windows 98

\* Windows 2000

\* MSDN documentation

\* Early GameDev.net

\* Early personal programmer websites



Avoid:



\* Glassmorphism

\* Rounded modern cards

\* Material Design

\* Large shadows

\* Bright gradients

\* Mobile-first SaaS styling



\---



\# Visual Style



Use:



\* Fixed-width layout (\~1000px)

\* Gray window panels

\* Blue title bars

\* 2px inset/outset borders

\* Pixel-style icons

\* Tahoma

\* Verdana

\* Courier New



Color palette:



Background: #C0C0C0



Window Background: #ECE9D8



Title Bar: #000080



Border Light: #FFFFFF



Border Dark: #404040



Link Blue: #0000EE



Text: #000000



\---



\# Folder Structure



```

src/



&#x20;   components/



&#x20;       window.ts



&#x20;       button.ts



&#x20;       menu.ts



&#x20;       statusbar.ts



&#x20;       counter.ts



&#x20;       ai-chat.ts



&#x20;       project-card.ts



&#x20;       desktop-icon.ts



&#x20;   pages/



&#x20;       home.ts



&#x20;       projects.ts



&#x20;       xr.ts



&#x20;       backend.ts



&#x20;       graphics.ts



&#x20;       blog.ts



&#x20;       resume.ts



&#x20;       contact.ts



&#x20;   services/



&#x20;       router.ts



&#x20;       api.ts



&#x20;       search.ts



&#x20;   styles/



&#x20;       windows.css



&#x20;       layout.css



&#x20;       typography.css



&#x20;       theme.css



public/



assets/



index.html

```



\---



\# Navigation



Top menu:



\* Home

\* Projects

\* Unity XR

\* Backend

\* Computer Graphics

\* Blog

\* Resume

\* Contact



Left sidebar:



\* System Information

\* Current Status

\* Visitor Counter

\* Last Updated

\* Music Playing

\* Links



\---



\# Homepage



The homepage should contain several "Windows" stacked vertically.



\## Welcome Window



Display:



Hello!



I'm Alicia Pankka.



Unity XR Developer



Backend Developer



Computer Graphics Enthusiast



Short introduction explaining my interests in:



\* XR

\* Rendering

\* Backend systems

\* C++

\* Distributed Systems



\---



\## Featured Projects Window



Show project thumbnails.



Projects include:



\* AIStart

\* VR Factory

\* Cosplay Event Map

\* OpenGL Renderer



Each project should have:



\* Image

\* Short description

\* Tech stack

\* Details button



\---



\## AI Assistant Window



This is the centerpiece of the website.



Design it like an old desktop application.



Layout:



Robot icon



Status:



ONLINE



Conversation area



Input textbox



Send button



The AI assistant should be named:



AliciaAI



The assistant should answer questions about:



\* My projects

\* Resume

\* Technical skills

\* Backend experience

\* Unity XR experience

\* Computer graphics work

\* Education

\* Research

\* Blog posts



The assistant should stream responses.



While thinking:



Display a fake dial-up loading animation.



\---



\## Latest Blog Posts



Show recent technical articles.



Examples:



\* Building XR User Interfaces

\* Designing VR Training Applications

\* Shadow Mapping in OpenGL

\* RabbitMQ for Distributed Systems



\---



\## System Information



Show:



OS



Editor



Languages



Coffee Level



Status



Current Learning



Current Project



These values can be hardcoded.



\---



\## Visitor Counter



A mechanical counter.



Example:



00001327



\---



\## Footer



Include:



Last Updated



Best viewed in 1024x768



Made with HTML



Thanks for visiting



\---



\# Pages



\## Projects



Allow filtering by:



\* Unity XR

\* Backend

\* Graphics

\* GIS


Each project should include:



Overview



Screenshots



Technologies



Lessons Learned



GitHub link



Demo link



\---



\## Unity XR



Projects focused on:



\* VR

\* AR

\* Quest

\* XR Interaction Toolkit



\---



\## Backend



Projects involving:



\* ASP.NET Core

\* RabbitMQ

\* PostgreSQL

\* Docker

\* gRPC

\* Distributed Systems



\---



\## Computer Graphics



This page should feel like an old graphics research page.



Sections:



OpenGL



Deferred Rendering



Shadow Mapping



PBR



SSAO



Bloom



Future Vulkan Experiments



Each project should contain:



Technical explanation



Pipeline diagram



Performance metrics



Screenshots



Source code



\---



\## Blog



Load articles from Markdown files.



Each article should include:



Title



Date



Reading time



Content



Previous/Next navigation



\---



\## Resume



Display:



Education



Work Experience



Skills



Languages



Download PDF button



\---



\## Contact



Display:



GitHub



LinkedIn



Email



Location



Simple contact form



\---



\# Retro Features



Include:



\* Visitor counter

\* Last updated timestamp

\* Fake Windows window controls

\* Pixel icons

\* CRT scanline mode toggle

\* Blinking status light

\* Windows XP-style buttons

\* Old-style scrollbars

\* Blue hyperlinks

\* Fake loading bars

\* "Best viewed in 1024×768"



Optional fun additions:



\* Under construction GIF

\* Guestbook

\* Dial-up connection animation while AI is responding

\* Fake desktop clock



\---



\# Responsiveness



The desktop version should remain the primary experience.



For mobile:



\* Stack windows vertically

\* Preserve the retro appearance

\* Do not redesign into a modern card layout



\---



\# Code Requirements



Write clean TypeScript.



Separate concerns.



Avoid large files.



Create reusable UI components.



No inline styles.



No external CSS frameworks.



Use semantic HTML where appropriate.



\---



\# Performance



Optimize for:



\* Fast loading

\* Small bundle size

\* Lazy loading images

\* Modular TypeScript



\---



\# Future Backend Integration



The frontend should be prepared to consume REST APIs.



Future endpoints:



```

GET /api/projects



GET /api/blog



GET /api/resume



POST /api/chat



GET /api/visitor-count

```



Keep all API calls isolated inside a dedicated service module.



\---



\# Overall Feeling



The website should look like a programmer's personal homepage from the early 2000s, but with modern engineering hidden underneath.



Visitors should immediately recognize that this is the portfolio of someone who enjoys building systems, not just styling websites.



The nostalgic design should reinforce my personality while showcasing my experience in Unity XR, backend development, and computer graphics. The AI assistant should be the standout feature, creating a memorable contrast between a retro interface and modern AI capabilities.



