# Specification

## Summary
**Goal:** Add an autoplaying background video to the landing page hero section.

**Planned changes:**
- Add a `<video>` element in the hero section of `LandingPage.tsx` that autoplays, is muted, loops, and plays inline
- Position the video absolutely to fill the entire hero section using `w-full h-full object-cover` with a low z-index so it sits behind all content
- Add a semi-transparent dark overlay between the video and the hero text/CTA buttons to maintain readability
- Set the video source to `frontend/public/assets/generated/library-hero-bg.mp4`
- Use the existing hero background image as the `poster` fallback attribute on the video element

**User-visible outcome:** When a user opens the website, a looping library scene video automatically plays silently in the background of the hero section, with all existing text and buttons remaining fully visible and functional on top.
