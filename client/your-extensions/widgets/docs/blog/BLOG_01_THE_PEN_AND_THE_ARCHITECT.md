# The Pen and the Architect: My Firsthand Experience Coding with AI

**Status:** ✅ Complete  
**Date:** January 2025  
**Widget:** QuerySimple for ArcGIS Experience Builder  
**Version:** v1.19.0-r017.9  
**Article Order:** 01 (First Article)

---

I spent four hours last week watching a ghost mess with my code.

I was building a custom Experience Builder widget. I'm a manager, not a daily coder. I haven't been in the weeds for five years, and I walked into this with zero experience in TypeScript or React. But I've been dealing with Esri products since the ArcIMS days. I know their patterns, and more importantly, I know exactly where they tend to hit a wall.

I was trying to get a "lazy-loading" list to behave. On paper, everything was fine. I'd test it and test it until I could do the steps in my sleep. But I don't stop there. Once the "happy path" works, I start doing things at random. I'll expand one record, collapse another, scroll halfway down, and then remove something from the middle.

That's when it would happen. Some random combination of steps would trigger that lazy-loading circle, the page would reset, and all the user's work would just vanish.

The AI kept trying to patch it. It was like watching a high-speed construction crew try to fix a house built on a swamp. They're fast, but they don't realize the ground is the problem.

## Walking Away

I'm a patient person. I don't throw laptops, but I do know when a strategy has hit a wall.

After hours of toiling, I stepped away. I realized that just because I started with the out-of-the-box Query widget didn't mean I had to keep the parts that weren't working. I had the AI document every single thing we'd done that actually worked, and then I told it to scrap the rest.

I rolled back the code and started as simply as possible. I replaced the "efficient" lazy load with a straightforward load I could actually predict.

In that moment, I wasn't the coder. I was the Architect. Since I knew Esri's tendency to build for GIS pros while ignoring the regular human user, I knew exactly what the simple version needed to look like.

## Not in "Our" World

In the software world, people like to say "it works" once the code runs without crashing. But that's the lowest bar you can set. You can use a rock to hammer a nail, and technically, it works. If you're only doing it once, maybe you don't care. But it's suboptimal, clunky, and a bad experience.

Working is step 1, not the finish line.

Esri builds great tools for GIS professionals, but they often struggle when it comes to the public: the non-GIS people who just want a clean experience. An app can be technically functional and still be a total failure if it's confusing. For me, usability is what's most important. It has to be simple, clean, and understandable.

## We Aren't Styling Buttons Anymore

When ArcGIS Online first came out, I had developers asking me what would happen to our jobs if the users could do everything themselves. My answer then is the same as it is now: we get smarter. We elevate.

AI is great at 90%. It can style a button 1,000 different ways faster than you can blink. Let it. We don't need to be button-stylers anymore.

Our value is in that last 10% that hasn't been solved yet. It's in the complex, outside-the-box logic, like creating a hidden "Helper" widget to listen for events because the main widget hasn't loaded yet. An AI won't suggest that because it's not in the documentation. It requires a human brain that's spent twenty years seeing how things actually break.

If you're a developer and you're worried about the future, remember this: you're being promoted. You're moving from the person who turns the wrench to the person who decides if we should be using a wrench at all.

The AI is just the pen. You're still the one writing the story.

---

## Related Articles

- [Opting for Simple over Lazy: Why We Switched from Lazy Loading to Simple List Rendering](./BLOG_TAMING_LAZY_LOAD_SCROLL.md) - The technical story behind the lazy loading decision mentioned in this article
- [Future Article: The Helper Widget Pattern] - Coming soon: How we solved widget communication timing issues
- [Future Article: Graphics Layer Highlighting] - Coming soon: Implementing persistent highlights independent of layer visibility


