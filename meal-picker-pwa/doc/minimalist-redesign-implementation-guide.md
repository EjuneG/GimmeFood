# GimmeFood Minimalist Redesign - Implementation Guide

**Version:** 1.0
**Last Updated:** 2025-10-11
**Branch:** `ui-redesign-minimalist`
**Status:** Phase 1 & 2 Complete (10/17 screens, 59%)

This document provides all specifications, patterns, and implementation details needed to continue the minimalist redesign of remaining screens.

---

## Table of Contents

1. [Design System Specifications](#design-system-specifications)
2. [Component Library Reference](#component-library-reference)
3. [Icon Mappings](#icon-mappings)
4. [Code Patterns & Conventions](#code-patterns--conventions)
5. [Animation Specifications](#animation-specifications)
6. [Completed Screens](#completed-screens)
7. [Remaining Screens Implementation Plan](#remaining-screens-implementation-plan)
8. [Reference Apps & Inspiration](#reference-apps--inspiration)

---

## Design System Specifications

### Color Palette

```javascript
// tailwind.config.js theme colors
colors: {
  background: '#FAFAFA',   // Warm white, main app background
  surface: '#FFFFFF',      // Pure white, card backgrounds
  primary: '#1A1A1A',      // Near black, main text
  secondary: '#666666',    // Medium gray, secondary text
  accent: {
    DEFAULT: '#E85D47',    // Warm terracotta, primary CTA
    light: '#F5A89C',      // Hover state
    dark: '#D44A33',       // Dark variant
  },
  divider: '#EEEEEE',      // Borders and separators
  muted: '#F5F5F5',        // Subtle backgrounds
}
```

**Usage Guidelines:**
- `background`: Use for main app background (min-h-screen)
- `surface`: Use for cards, modals, elevated surfaces
- `primary`: Main text color (headings, body text)
- `secondary`: Secondary/helper text, icons
- `accent`: CTAs, active states, highlights
- `divider`: Borders, separators
- `muted`: Subtle backgrounds, hover states

### Typography System

```javascript
// tailwind.config.js fontSize
fontSize: {
  'title': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],      // 24px - Page titles
  'section': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],   // 18px - Section headers
  'body': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],     // 15px - Body text
  'caption': ['0.8125rem', { lineHeight: '1.4', fontWeight: '400' }],  // 13px - Helper text
}
```

**Font Stack:**
```javascript
fontFamily: {
  sans: ['Inter', 'Noto Sans SC', ...fontFamily.sans],
}
```

**Usage:**
- `text-title`: H1, page titles
- `text-section`: H2, section headings
- `text-body`: Main body text, form labels
- `text-caption`: Helper text, metadata

**Important:** Base font size is 15px (not 14px) for better Chinese character readability. Line-height is 1.5 for Chinese text.

### Spacing System

```javascript
// Standard spacing scale (Tailwind default)
spacing: {
  2: '8px',    // Micro - Icon-to-text, compact padding
  4: '16px',   // Small - Component internal padding, list gaps
  6: '24px',   // Medium - Section spacing, card padding
  8: '32px',   // Large - Screen edge padding (mobile)
  12: '48px',  // XLarge - Major section breaks
}

// PWA Safe Areas
'safe-top': 'max(1rem, env(safe-area-inset-top))',
'safe-bottom': 'calc(1rem + env(safe-area-inset-bottom))',
'safe-bottom-nav': 'calc(4rem + env(safe-area-inset-bottom))',
```

### Border Radius

```javascript
borderRadius: {
  'lg': '8px',   // Small elements
  'xl': '12px',  // Buttons, inputs
  '2xl': '16px', // Cards, containers
}
```

### Animation Timing

```javascript
transitionDuration: {
  'fast': '150ms',    // Hover states, color changes
  'base': '200ms',    // Button presses, toggles
  'slow': '300ms',    // Page transitions, drawers
  'slower': '500ms',  // Progress bars, data updates
}

transitionTimingFunction: {
  'out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Material standard
  'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful spring
  'smooth': 'cubic-bezier(0.4, 0.0, 0.6, 1)',    // Gentle decel
}
```

### Shadows

```javascript
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'focus': '0 0 0 2px #E85D47',
}
```

---

## Component Library Reference

### Location: `/src/components/ui/`

All base components are in this folder. Import via:
```javascript
import { Button, Card, Radio, ProgressBar, Avatar } from './ui';
// OR individually
import { Button } from './ui/Button.jsx';
```

### Button Component

**File:** `src/components/ui/Button.jsx`

```javascript
<Button
  variant="primary"    // 'primary' | 'secondary' | 'ghost'
  size="default"       // 'small' | 'default' | 'large'
  className="..."      // Additional Tailwind classes
  disabled={false}
>
  <Icon size={20} />
  Button Text
</Button>
```

**Variants:**
- `primary`: Accent background, white text (main CTAs)
- `secondary`: Outlined, hover fill (secondary actions)
- `ghost`: Minimal, hover background (tertiary actions)

**Sizes:**
- `small`: 40px height, text-caption
- `default`: 48px height, text-body
- `large`: 56px height, text-section

**Features:**
- Built-in active:scale-[0.98] animation
- Focus ring with accent color
- Disabled state styling

### Card Component

**File:** `src/components/ui/Card.jsx`

```javascript
<Card className="...">
  {children}
</Card>
```

**Default Styles:**
- bg-surface (white)
- rounded-2xl
- shadow-sm
- border border-divider
- p-6

### Radio Component

**File:** `src/components/ui/Radio.jsx`

```javascript
<Radio checked={isSelected} className="..." />
```

**Features:**
- 20px outer circle
- 12px inner fill when checked
- Spring animation (scale 0→1, stiffness: 500, damping: 30)
- Accent color when checked, secondary when unchecked

### ProgressBar Component

**File:** `src/components/ui/ProgressBar.jsx`

```javascript
<ProgressBar
  value={currentValue}
  max={targetValue}
  animate={true}        // Enable entrance animation
  className="..."
/>
```

**Features:**
- Monochrome design (#1A1A1A on #EEEEEE)
- 6px height, 4px border radius
- Animated fill (0% → actual value, 500ms)
- Smooth transition on value changes

### Avatar Component

**File:** `src/components/ui/Avatar.jsx`

```javascript
<Avatar
  initial="A"              // Character to display
  featured={true}          // Use accent color
  className="..."
/>
```

**Default Styles:**
- 40px circle
- `featured={true}`: bg-accent text-white
- `featured={false}`: bg-muted border-2 border-divider

---

## Icon Mappings

### Emoji → Lucide Icons

**Import:**
```javascript
import { IconName } from 'lucide-react';
```

**Standard Size:** 20px for buttons/UI, 16px for inline

**Common Mappings:**

| Old Emoji | New Lucide Icon | Usage |
|-----------|----------------|-------|
| 🎲 | `Shuffle` | Random recommendation button |
| 👨‍🍳 | `ChefHat` | Cook myself feature |
| 🍽️ / 🍜 | `List` | Manual selection |
| 🌅 | `Sunrise` | Breakfast |
| 🍜 (sun) | `Sun` | Lunch |
| 🌙 | `Moon` | Dinner |
| 🍿 | `Sparkles` | Snacks |
| 🏠 | `Home` | Home navigation |
| 📊 | `BarChart3` | Nutrition stats |
| ⚙️ | `Settings` | Settings/management |
| ✏️ | `Edit2` | Edit action (16px) |
| 🗑️ | `Trash2` | Delete action (16px) |
| ✓ / ✅ | `Check` | Success/confirmation |
| ❌ | `X` | Close/cancel |
| 🔄 | `RefreshCw` | Refresh/reload |
| ← | `ArrowLeft` | Back navigation |
| → | `ChevronRight` | Forward/more |
| 📅 | `Calendar` | Date picker |
| 💡 | `Lightbulb` | Tips/advice |
| 🎯 | `Target` | Goals/targets |
| 📱 | `Smartphone` | Mobile features |
| 🚀 | `Rocket` | Launch/start |
| 🎉 | `PartyPopper` | Success celebration |
| ➕ | `Plus` | Add action |
| 🔍 | `Filter` | Filter/search |

**Usage Example:**
```javascript
import { Shuffle, Check, X } from 'lucide-react';

<button>
  <Shuffle size={20} className="text-accent" />
  随机推荐
</button>
```

---

## Code Patterns & Conventions

### Header Pattern (All Screens)

```javascript
// Replace gradient headers with this:
<div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-title font-semibold mb-2">Screen Title</h1>
      <p className="text-caption text-secondary">Subtitle text</p>
    </div>
    <button
      className="p-2 hover:bg-muted rounded-lg transition-colors"
      aria-label="Action name"
    >
      <Icon size={20} className="text-secondary" />
    </button>
  </div>
</div>
```

### Main Container Pattern

```javascript
<div className="min-h-screen bg-background pb-20">
  {/* Header */}
  {/* Content with padding */}
  <div className="px-4 pt-6 space-y-4">
    {/* Content here */}
  </div>
</div>
```

**Note:** `pb-20` accounts for bottom navigation (64px + safe area)

### List Item Pattern

```javascript
<div className="space-y-0">
  {items.map(item => (
    <button
      key={item.id}
      className="flex items-center gap-3 w-full px-4 py-4
        border-b border-divider hover:bg-muted transition-colors"
    >
      <Avatar initial={item.name[0]} featured={item.featured} />
      <div className="flex-1 text-left">
        <h3 className="text-body font-medium">{item.name}</h3>
        <p className="text-caption text-secondary">{item.subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-secondary" />
    </button>
  ))}
</div>
```

### Form Input Pattern

```javascript
<div>
  <label htmlFor="input-id" className="block text-body font-medium mb-2">
    Label Text <span className="text-accent">*</span>
  </label>
  <input
    id="input-id"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className={`w-full px-4 py-3 border-2 rounded-xl bg-surface
      focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
      transition-all text-body
      ${error ? 'border-accent' : 'border-divider'}
    `}
    placeholder="Placeholder text..."
    aria-invalid={!!error}
    aria-describedby={error ? "input-error" : undefined}
  />
  {error && (
    <p id="input-error" className="text-accent text-caption mt-1.5" role="alert">
      {error}
    </p>
  )}
</div>
```

### Multi-Select Button Pattern

```javascript
{options.map(option => {
  const isSelected = selectedOptions.includes(option.value);
  return (
    <button
      key={option.value}
      type="button"
      onClick={() => toggleOption(option.value)}
      className={`
        py-3 px-4 text-body font-medium rounded-xl
        transition-all duration-base
        flex items-center justify-center gap-2
        ${isSelected
          ? 'bg-accent text-white shadow-md'
          : 'bg-muted text-secondary hover:bg-divider hover:text-primary border border-divider'
        }
      `}
      aria-pressed={isSelected}
    >
      {isSelected && <Check size={16} />}
      {option.label}
    </button>
  );
})}
```

### Empty State Pattern

```javascript
<Card className="text-center">
  <div className="py-4">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon size={32} className="text-secondary" aria-hidden="true" />
    </div>
    <h3 className="font-semibold text-body mb-2">Empty State Title</h3>
    <p className="text-caption text-secondary mb-4">
      Description text
    </p>
    <Button variant="primary" onClick={action}>
      Primary Action
    </Button>
  </div>
</Card>
```

### Utility Function: className merger

**File:** `src/utils/cn.js`

```javascript
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
```

**Usage:**
```javascript
import { cn } from '../utils/cn.js';

className={cn(
  'base classes',
  condition && 'conditional classes',
  anotherCondition ? 'true classes' : 'false classes',
  propsClassName
)}
```

---

## Animation Specifications

### Framer Motion Import

```javascript
import { motion } from 'framer-motion';
```

### Common Animations

#### 1. Page Entrance

```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {content}
</motion.div>
```

#### 2. Card Pop-in (Spring)

```javascript
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
>
  {content}
</motion.div>
```

#### 3. Success Icon Animation

```javascript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
  className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
>
  <Check className="text-accent" size={32} />
</motion.div>
```

#### 4. Rotating Icon (Loading)

```javascript
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
>
  <Icon size={48} className="text-accent" />
</motion.div>
```

#### 5. Shuffle Button Rotation

```javascript
const [isShuffling, setIsShuffling] = useState(false);

<motion.div
  animate={{ rotate: isShuffling ? 360 : 0 }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
>
  <Shuffle size={20} />
</motion.div>
```

#### 6. Staggered List Entrance

```javascript
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

#### 7. Number Counter Animation

```javascript
<motion.span
  key={currentValue}
  initial={{ y: 10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="tabular-nums"
>
  {currentValue}
</motion.span>
```

#### 8. Collapsible Content

```javascript
{isExpanded && (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3, ease: [0.4, 0.0, 0.6, 1] }}
  >
    {content}
  </motion.div>
)}
```

---

## Completed Screens

### Phase 1 (Commit: 5e31a3f)
1. ✅ **MainScreen.jsx** (286 lines)
   - Shuffle icon with rotation animation
   - Three-button layout (primary + 2 secondary)
   - Meal type selection modal
   - Empty state handling

2. ✅ **BottomTabNavigation.jsx** (140 lines)
   - 4 tabs: Home, Sparkles, BarChart3, Settings
   - Active state: scale 1.1, y: -2px, stroke 2.5
   - Animated indicator bar (layoutId for smooth transitions)
   - Screen reader support

3. ✅ **NutritionDashboard.jsx** (86 lines)
   - Clean header with Calendar icon
   - Info card with Lightbulb icon
   - Quick actions section

4. ✅ **NutritionGoalCard.jsx** (179 lines)
   - Monochrome progress bars
   - Animated number counters
   - Collapsible weekly stats
   - Tabular numbers for alignment

5. ✅ **ManagementScreen.jsx** (227 lines)
   - Stats grid (3 columns)
   - Compact list with avatars
   - Edit/Delete actions (16px icons)
   - Empty state

6. ✅ **ResultScreen.jsx** (340 lines)
   - Loading animation (rotating Sparkles)
   - Success animation (checkmark pop-in)
   - 3-step reselection flow
   - Avatar display with featured styling

### Phase 2 (Commit: 7c24d9f)
7. ✅ **RestaurantForm.jsx** (340 lines)
   - Clean input with validation
   - Multi-select with checkmarks
   - Proper ARIA labels
   - QuickRestaurantForm variant

8. ✅ **WelcomeScreen.jsx** (225 lines)
   - 3-state flow: welcome → setup → complete
   - Staggered entrance animations
   - Feature list with icons
   - Success celebration

9. ✅ **ManualSelectionScreen.jsx** (239 lines)
   - Two-stage selection
   - Filter system
   - Avatar integration
   - Empty state handling

10. ✅ **Base Components** (ui/ folder)
    - Button, Card, Radio, ProgressBar, Avatar
    - Utilities (cn.js)

---

## Remaining Screens Implementation Plan

### Priority 1: Nutrition Input Screens (Core Flow)

#### 1. NutritionInput.jsx
**Current State:** Form with gradient backgrounds, emoji icons
**Changes Needed:**
- Remove gradient header → `bg-surface border-b border-divider`
- Replace emoji with Lucide icons
- Use standard form input pattern
- Number inputs for calories/protein/carbs/fat
- Add `<Plus>` icon for "添加" button
- Use `<ArrowLeft>` for back navigation

**Pattern Reference:**
```javascript
// Header
<div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
  <h1 className="text-title font-semibold mb-2">记录营养</h1>
  <p className="text-caption text-secondary">
    {restaurant.name} - {MEAL_TYPE_NAMES[mealType]}
  </p>
</div>

// Number Input
<input
  type="number"
  inputMode="decimal"
  className="w-full px-4 py-3 border-2 border-divider rounded-xl
    focus:ring-2 focus:ring-accent focus:border-accent"
/>
```

#### 2. NutritionResult.jsx
**Current State:** Success screen with gradient, emoji
**Changes Needed:**
- Use success animation pattern from ResultScreen
- Show checkmark with spring animation
- Display entered values in Card component
- Use ProgressBar component to show progress
- Replace "查看详情" with proper Button component

**Animation Pattern:**
```javascript
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
  className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
>
  <Check className="text-accent" size={32} />
</motion.div>
```

#### 3. NutritionGoalSetup.jsx
**Current State:** Goal setup form with gradients
**Changes Needed:**
- Multi-step form (goal type → values → confirmation)
- Use form input pattern
- Add helper text for each input
- Use radio buttons for goal type selection
- Implement validation with accent-colored errors

**Form Structure:**
```javascript
// Goal Type Selection
<div className="grid grid-cols-2 gap-3">
  {goalTypes.map(type => (
    <button
      className={`py-4 rounded-xl ${
        selected ? 'bg-accent text-white' : 'bg-muted'
      }`}
    >
      <Icon size={24} />
      <span>{type.name}</span>
    </button>
  ))}
</div>
```

#### 4. NutritionPrompt.jsx
**Current State:** Prompt to track nutrition after meal
**Changes Needed:**
- Simple Card with two buttons
- Use Lightbulb icon for "为什么要记录"
- Primary button: "记录营养"
- Secondary button: "稍后记录" or "跳过"

**Structure:**
```javascript
<Card>
  <div className="text-center">
    <Lightbulb className="text-accent mx-auto mb-4" size={32} />
    <h2 className="text-section font-semibold mb-2">记录这餐的营养？</h2>
    <p className="text-caption text-secondary mb-6">
      帮助你追踪每日营养摄入目标
    </p>
    <div className="space-y-3">
      <Button variant="primary" size="large" className="w-full">
        记录营养
      </Button>
      <Button variant="secondary" className="w-full">
        稍后记录
      </Button>
    </div>
  </div>
</Card>
```

### Priority 2: Modal Components

#### 5. FeedbackModal.jsx
**Current State:** Modal with gradient, emoji reactions
**Changes Needed:**
- Remove gradient backgrounds
- Use monochrome design
- Replace emoji reactions with simple radio buttons or scale (1-5)
- Add smooth entrance animation (slide up from bottom)
- Use Card component as modal container

**Modal Pattern:**
```javascript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="fixed inset-0 bg-primary/50 z-50 flex items-end"
  onClick={onClose}
>
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="w-full bg-surface rounded-t-2xl p-6"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Modal content */}
  </motion.div>
</motion.div>
```

#### 6. DataManagement.jsx
**Current State:** Modal for import/export
**Changes Needed:**
- Remove gradient
- Use Upload/Download icons from Lucide
- Simple list of actions
- Confirmation dialogs with Card

**Action List Pattern:**
```javascript
<Card>
  <h2 className="text-section font-semibold mb-4">数据管理</h2>
  <div className="space-y-2">
    {actions.map(action => (
      <button
        className="flex items-center gap-3 w-full p-4 hover:bg-muted rounded-xl"
      >
        <action.Icon size={20} className="text-secondary" />
        <div className="flex-1 text-left">
          <h3 className="text-body font-medium">{action.title}</h3>
          <p className="text-caption text-secondary">{action.desc}</p>
        </div>
        <ChevronRight size={16} className="text-secondary" />
      </button>
    ))}
  </div>
</Card>
```

### Priority 3: Notifications

#### 7. UpdateNotification.jsx
**Current State:** Banner with gradient
**Changes Needed:**
- Remove gradient → use `bg-surface border border-divider`
- Add shadow-lg for elevation
- Use RefreshCw icon
- Slide in from top animation
- Toast-style notification

**Structure:**
```javascript
<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="fixed top-4 left-4 right-4 z-50"
>
  <Card className="flex items-center gap-3 p-4 shadow-lg">
    <RefreshCw size={20} className="text-accent" />
    <div className="flex-1">
      <p className="text-body font-medium">新版本可用</p>
      <p className="text-caption text-secondary">点击更新以获取最新功能</p>
    </div>
    <Button variant="primary" size="small">
      更新
    </Button>
  </Card>
</motion.div>
```

---

## Implementation Checklist Template

For each remaining screen, follow this checklist:

### Visual Changes
- [ ] Remove all gradient backgrounds
- [ ] Replace emoji icons with Lucide icons
- [ ] Update color scheme to design system palette
- [ ] Use typography system (text-title, text-section, text-body, text-caption)
- [ ] Apply consistent spacing (px-4, py-4, gap-4, etc.)
- [ ] Use rounded-xl for buttons, rounded-2xl for cards

### Component Integration
- [ ] Import and use Button component (not raw <button> with gradients)
- [ ] Wrap content in Card component where appropriate
- [ ] Use Avatar component for initials
- [ ] Use ProgressBar for any progress indicators
- [ ] Use Radio for radio selections

### Accessibility
- [ ] Add aria-label to icon-only buttons
- [ ] Use proper htmlFor on form labels
- [ ] Add aria-invalid and aria-describedby for form validation
- [ ] Include role="alert" for error messages
- [ ] Add aria-hidden="true" to decorative icons

### Animations
- [ ] Add entrance animation (page load)
- [ ] Add hover states (transition-colors duration-fast)
- [ ] Add active states (active:scale-[0.98])
- [ ] Use spring animations for important interactions
- [ ] Test @prefers-reduced-motion support

### Code Quality
- [ ] Remove unused imports
- [ ] Use cn() utility for conditional classNames
- [ ] Follow naming conventions
- [ ] Add JSDoc comments
- [ ] Test in browser

---

## Reference Apps & Inspiration

### Linear (linear.app)
**Key Takeaways:**
- Monochrome with single accent color
- Keyboard-first design translating to touch
- Clean, purposeful minimalism
- Visual hierarchy through whitespace, not color

**What We Applied:**
- Reduced color usage dramatically (20+ → 7 colors)
- Single accent color (#E85D47)
- Command-focused interactions

### Things 3 (iOS app)
**Key Takeaways:**
- Subtle, deeply satisfying animations
- Smooth spring physics (not linear)
- Haptic feedback moments
- Balance between subtlety and utility

**What We Applied:**
- Spring animations (stiffness: 400-500, damping: 20-30)
- Button press feedback (scale: 0.98)
- Success celebrations with bounce
- Hover states with smooth transitions

### Stripe Dashboard
**Key Takeaways:**
- High data-ink ratio (remove everything that doesn't inform)
- Muted progress bars
- Clean typography hierarchy
- Restrained color schemes

**What We Applied:**
- Monochrome progress bars (#1A1A1A on #EEEEEE)
- Removed decorative elements
- Clear visual hierarchy through size and weight
- Tabular numbers for data alignment

---

## Build & Test Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## Git Workflow

```bash
# Current branch
git checkout ui-redesign-minimalist

# Pull latest changes
git pull origin ui-redesign-minimalist

# Make changes...

# Stage and commit
git add .
git commit -m "feat: Redesign [ScreenName] with minimalist aesthetic"

# Push to remote
git push origin ui-redesign-minimalist
```

---

## Notes & Tips

### Design Principles to Remember
1. **Reduction Over Addition** - Remove first, add only what's necessary
2. **Hierarchy Through Space** - Use whitespace, not color variety
3. **Intentional Contrast** - Guide attention with typography and subtle color
4. **Playful Restraint** - Personality through micro-interactions, not visual noise
5. **Touch-First Ergonomics** - 44px minimum touch targets

### Common Pitfalls to Avoid
- ❌ Don't add new gradient backgrounds
- ❌ Don't use emoji icons in new components
- ❌ Don't create new color variants outside the palette
- ❌ Don't forget accessibility attributes
- ❌ Don't use arbitrary spacing values (use scale: 2, 4, 6, 8, 12)
- ❌ Don't make animations too fast (<150ms feels rushed)

### Performance Considerations
- Use `will-change: transform, opacity` sparingly (only during animation)
- Prefer `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `left`, `top` (causes reflow)
- Use `transition-all` cautiously (specify properties when possible)

---

## Quick Reference: Before & After Examples

### Header Comparison

**Before:**
```javascript
<div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white px-6 pt-12 pb-8">
  <div className="text-4xl mb-2">🍽️</div>
  <h1 className="text-2xl font-bold">Page Title</h1>
</div>
```

**After:**
```javascript
<div className="bg-surface border-b border-divider px-6 pt-12 pb-8">
  <h1 className="text-title font-semibold mb-2">Page Title</h1>
  <p className="text-caption text-secondary">Subtitle</p>
</div>
```

### Button Comparison

**Before:**
```javascript
<button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700">
  按钮文字
</button>
```

**After:**
```javascript
<Button variant="primary" size="default">
  <Icon size={20} />
  按钮文字
</Button>
```

### List Item Comparison

**Before:**
```javascript
<div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md">
  <div className="flex items-center space-x-4">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
      <span>🍜</span>
    </div>
    <div>
      <h3 className="font-bold">{name}</h3>
    </div>
  </div>
</div>
```

**After:**
```javascript
<button className="flex items-center gap-3 w-full px-4 py-4 border-b border-divider hover:bg-muted transition-colors">
  <Avatar initial={name[0]} featured={isFeatured} />
  <div className="flex-1 text-left">
    <h3 className="text-body font-medium">{name}</h3>
    <p className="text-caption text-secondary">{subtitle}</p>
  </div>
  <ChevronRight size={16} className="text-secondary" />
</button>
```

---

## Conclusion

This guide provides everything needed to continue the minimalist redesign. The foundation is solid, patterns are established, and the remaining 7 screens follow similar patterns to what's already been completed.

**Key Success Factors:**
- Consistency with existing redesigned screens
- Follow the established patterns
- Use the component library
- Maintain the design system
- Test animations and accessibility

**Estimated Time:**
- Priority 1 (Nutrition screens): ~3-4 hours
- Priority 2 (Modals): ~2 hours
- Priority 3 (Notifications): ~1 hour
- **Total: ~6-7 hours for complete redesign**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-11
**Author:** Claude (Anthropic)
**Branch:** ui-redesign-minimalist
**Commits:** 5e31a3f (Phase 1), 7c24d9f (Phase 2)
