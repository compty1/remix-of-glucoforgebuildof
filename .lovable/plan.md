

# Implementation Plan: Transparent Logo with Animated Drop Effect

## Overview
This plan focuses exclusively on two tasks:
1. Generate new logo assets with transparent backgrounds
2. Add a CSS animation to the blood drop icon that simulates a dripping/dropping motion

---

## Current State

| Asset | Current Issue |
|-------|---------------|
| `glycoforge-logo.png` | Has purple gradient background |
| `glycoforge-icon.png` | Has off-white/light background |
| `glucoforge-icon.svg` | Has solid purple background |

The logos are used in:
- Home page hero (`src/pages/Index.tsx`)
- Auth page (`src/pages/Auth.tsx`)
- Reset Password page (`src/pages/ResetPassword.tsx`)
- Sidebar navigation (`src/components/AppSidebar.tsx`)

---

## Implementation Steps

### Step 1: Generate Transparent Logo Assets

Use AI image generation to create new versions of the logo assets with transparent backgrounds, maintaining the exact same blood drop design and "GlycoForge" text styling.

**Assets to regenerate:**
1. `glycoforge-logo.png` - Full logo with text (transparent background)
2. `glycoforge-icon.png` - Icon only (transparent background)

The regenerated assets will preserve:
- The pink-to-purple gradient blood drop design
- The white "GlycoForge" text styling
- The sparkle/star accents around the drop

### Step 2: Add Drop Animation CSS

Add new keyframe animations to `src/index.css`:

```css
/* Blood Drop Animation - simulates dripping/falling effect */
@keyframes bloodDropFall {
  0% {
    transform: translateY(-8px) scale(0.95);
    opacity: 0.7;
  }
  40% {
    transform: translateY(0px) scale(1);
    opacity: 1;
  }
  60% {
    transform: translateY(2px) scale(1.02, 0.98);
  }
  80% {
    transform: translateY(-1px) scale(0.99, 1.01);
  }
  100% {
    transform: translateY(0px) scale(1);
    opacity: 1;
  }
}

@keyframes dropBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes dropPulse {
  0%, 100% {
    filter: drop-shadow(0 2px 8px hsl(var(--brand-purple-light) / 0.4));
  }
  50% {
    filter: drop-shadow(0 4px 12px hsl(var(--brand-purple-light) / 0.6));
  }
}

.animate-drop-fall {
  animation: bloodDropFall 1.2s ease-out forwards;
}

.animate-drop-bounce {
  animation: dropBounce 2s ease-in-out infinite;
}

.animate-drop-pulse {
  animation: dropPulse 3s ease-in-out infinite;
}

/* Combined animation for logo on load */
.logo-animated-drop {
  animation: bloodDropFall 1s ease-out, dropBounce 2.5s ease-in-out 1s infinite, dropPulse 4s ease-in-out 1s infinite;
}
```

### Step 3: Update Logo Components

Apply the animation class to logo images in:

**`src/pages/Index.tsx`** (line ~76):
```tsx
<img src={logoImage} alt="GlucoForge" className="h-24 w-auto max-w-md logo-animated-drop" />
```

**`src/components/AppSidebar.tsx`** (lines ~267, ~271):
```tsx
// Icon in collapsed state
<img src={iconImage} alt="GF" className="h-8 w-8 flex-shrink-0 logo-animated-drop" />

// Full logo in expanded state
<img src={logoImage} alt="GlycoForge" className="h-8 w-auto max-w-full flex-shrink-0 logo-animated-drop" />
```

**`src/pages/Auth.tsx`** (lines ~197, ~314):
```tsx
<img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
```

**`src/pages/ResetPassword.tsx`** (all logo instances):
```tsx
<img src={logoImage} alt="GlucoForge" className="h-12 w-auto logo-animated-drop" />
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| Replace | `src/assets/glycoforge-logo.png` (transparent version) |
| Replace | `src/assets/glycoforge-icon.png` (transparent version) |
| Modify | `src/index.css` (add animation keyframes) |
| Modify | `src/pages/Index.tsx` (add animation class) |
| Modify | `src/pages/Auth.tsx` (add animation class) |
| Modify | `src/pages/ResetPassword.tsx` (add animation class) |
| Modify | `src/components/AppSidebar.tsx` (add animation class) |

---

## Animation Behavior

The combined animation creates a natural blood drop effect:

1. **Initial Drop** (0-1s): Logo "falls" into position with slight bounce/squish on landing
2. **Gentle Bounce** (continuous): Subtle up-and-down floating motion
3. **Glow Pulse** (continuous): Soft purple shadow pulsing effect

All animations respect `prefers-reduced-motion` by checking media query:
```css
@media (prefers-reduced-motion: reduce) {
  .logo-animated-drop {
    animation: none;
  }
}
```

---

## Technical Notes

- The transparent PNG assets will work on both light and dark backgrounds
- Animation uses CSS transforms for GPU acceleration and smooth performance
- The drop-shadow filter creates a subtle glow without affecting layout
- Animation timing is staggered so initial drop completes before continuous effects begin

