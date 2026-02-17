

# Add Drop Logo Next to GlucoForge Text in Sidebar

## Problem
In the expanded sidebar state (line 339-344), only the "GlucoForge" text is shown -- no drop icon. The collapsed state already shows the drop icon with the `logo-animated-drop` animation, but when expanded, the icon disappears.

## Solution
Add the drop icon image to the left of the "GlucoForge" text in the expanded sidebar view, with proper sizing and spacing, and include the existing drop/splash entrance animation.

## Technical Changes

### File: `src/components/AppSidebar.tsx` (lines 339-344)

**Current code:**
```tsx
<div className="flex items-center gap-2.5 w-full px-2">
    <span className="text-xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-purple-light bg-clip-text text-transparent">
      GlucoForge
    </span>
</div>
```

**Updated code:**
```tsx
<div className="flex items-center gap-2 w-full px-2">
    <img 
      src={dropIcon} 
      alt="GF" 
      className="h-7 w-7 flex-shrink-0 logo-animated-drop object-contain" 
    />
    <span className="text-xl font-bold bg-gradient-to-r from-brand-purple-dark to-brand-purple-light bg-clip-text text-transparent">
      GlucoForge
    </span>
</div>
```

Key details:
- Uses the already-imported `dropIcon` (the SVG blood drop logo)
- `h-7 w-7` sizing keeps it proportional next to the text without overwhelming it
- `flex-shrink-0` prevents the icon from shrinking
- `object-contain` ensures proper aspect ratio
- `logo-animated-drop` class applies the existing `bloodDropFall` entrance animation plus the bounce and pulse effects (already defined in `index.css`)
- `gap-2` tightens the spacing between icon and text slightly

No other files need changes -- the animation CSS and icon import are already in place.

