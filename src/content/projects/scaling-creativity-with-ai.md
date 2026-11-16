---
title: scaling creativity with AI
year: "2025"
discipline: Creative operations
tagline: we stopped buying creative tools. we started building one.
role: Creative operations, Scalability
client: Adyen
cardBg: "#ffffff"
cardFg: "#000000"
cover: /images/scaling-creativity-with-ai/cover.png
order: 7
visibility: public
problem: |-
  The existing system was a paradox. We had over 200 templates in our Brand Portal, Figma licenses across thousands of licensed seats, and a Storyteq integration for motion. On paper, every creative need was covered. In reality, 77.4% of marketers reported a lack of creative variety, and 41.9% never used the video templates because they were too cumbersome to work with. More options hadn't produced more output. It had produced more friction.
  The deeper problem: we were spending heavily on tools that didn't talk to each other, produced mostly static assets, broke when users made small changes, and gave us zero data on what was actually performing. We weren't just behind the industry benchmark for digital creative, we couldn't even see how far behind we were.
solution: |-
  Even after quite te reserach, there was no off-the-shelf platform that solved this. Traditional Creative Management Platforms come with annual licenses upwards of €100k, closed ecosystems, vendor lock-in, and product roadmaps that don't match our speed. What we actually needed wasn't another tool, it was a control plane. Something that separates the strategic brand and product elements, our "brain" (our tone of voice, product positioning, persona logic, performance data, brand guidelines) from the technical "muscle" (the rendering engine that produces the assets).

  So, I've researched and asked our potential users what they needed from a tool like this, and now we're building it. A headless, API-first architecture where a custom shell  — designed and owned by us — orchestrates a rendering engine (Abyssale) and an AI layer (Gemini enterprise) to produce on-brand static, motion, and HTML5 assets at scale.

  Four "brains" sit behind the system, each owned by a different team: Creative Studio owns templates, Content owns tone of voice, Product Marketing owns persona and product logic, and Digital Performance owns the data feedback loop. The AI uses all of them to help marketers write better copy, pick the right format, and get flagged when something's off-brand, before anything renders.

  The architecture is deliberately modular. If a better rendering engine comes along, we swap it out. If a new AI model performs better, we swap it out. The strategic logic stays ours.

  Currently in development with a phased rollout late summer 2026. The foundation is set: Abyssale validated as the primary rendering engine, enterprise license in place, Figma-to-API pipeline architected, governance model approved. A campaign set of 44 assets (static, animated and HTML5) that previously required manual Figma production will render out for less than €2. At projected volume, total annual savings versus the current tool stack sit in the high six numbers — not even including  the time marketers get back, the A/B tests we can now run affordably, or the performance lift from moving from static to motion (industry benchmarks suggest 1.4x CTR for video, 15-25% for HTML5).

  The real outcome is harder to put in a number: we're building a creative function that scales with AI instead of being replaced by it. Where the system handles the repetitive, rules-based work and the team focuses on the strategy, the craft, and the stories that actually matter.
gallery:
  - src: /images/scaling-creativity-with-ai/gallery-01.gif
  - src: /images/scaling-creativity-with-ai/gallery-02.jpg
  - src: /images/scaling-creativity-with-ai/gallery-03.jpg
  - src: /images/scaling-creativity-with-ai/gallery-04.jpg
---

This project started from a frustration I'd had for years. Every creative operations problem I'd solved before: templates, guidelines, asset libraries, brand portals. We kept asking marketers to act like designers, and designers to act like production managers, and neither group was happy or effective. The tools we were buying were built for a world where creative ops meant "faster static ads." That's not the world anymore.

The shift came when I stopped thinking about it as a tooling problem and started thinking about it as a platform problem. The right question isn't "which Creative Management Platform should we buy?" It's "what does a creative system look like when AI is a colleague, not just a feature?" The answer looks nothing like what's on the market today.

Most creative automation tools treat AI as a content generator: type a prompt, get an ad. But honestly, that's not governance. That's just chaos, but at scale. The model I'm building is the opposite: AI as a helping hand and a guardrail. It reads the tone of voice document, the persona logic, the performance data, and the messaging playbooks (all our company, data and product data) and uses all of it to help marketers create work that's genuinely on-brand, precisely on-strategy, and much, much better than what they'd produce on their own.

The part I'm most proud of is the governance model. Four teams, four "brains," each responsible for their own piece of the system. Studio owns visual craft. Content owns language. Product Marketing owns positioning. Digital Performance owns the data. Nobody's work lands in a black box. Everyone's expertise compounds into every asset the system produces.

I've done this before at smaller scale. A few years ago I built a self-serve system that dropped creative briefings by 70% while our stakeholder base grew 260%. That work taught me what good creative infrastructure looks like. This is what happens when you take those principles and apply them to the AI era, not as a pilot or an experiment, but as the foundation for how an enterprise creative team should operate.

It's not live yet. That's the honest answer to "what are the results?" (Believe me, I can't wait for those as well). But the thesis is right, the architecture is sound, and the build is moving. When I look at where the industry is going, AI-native creative, persona-driven content, performance-led iteration, this is what the next generation of creative ops looks like.
