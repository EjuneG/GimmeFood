# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Gimme Food" - a Progressive Web App (PWA) designed to eliminate meal decision fatigue. The app allows users to pre-configure meal options and use an algorithmic "Gimme Food!" button for instant meal selection. The interface is primarily in Chinese with sophisticated weighted selection algorithms.

Key design documents are located in `meal-picker-pwa/doc/`:
- `gimme-food-summary.md` - Complete project overview and technical architecture
- `gimme_food_requirements.md` - Detailed feature requirements in Chinese

## Architecture

**Frontend Stack:**
- React 19 with modern hooks-based development
- Vite with Rolldown bundler for build tooling
- Tailwind CSS v4 for styling
- PWA capabilities via vite-plugin-pwa

**Data Architecture:**
- 100% client-side application - no backend required
- Local storage/IndexedDB for data persistence
- All data stays on user's device for privacy
- Offline-first PWA design

**Core Algorithm:**
- Weighted restaurant selection based on user-defined tiers (夯 > 顶级 > 人上人 > NPC > 拉完了)
- Dynamic weight adjustment based on user behavior and feedback
- Anti-repetition logic to avoid recent selections
- Abstract question system for psychological control feeling

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
meal-picker-pwa/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── doc/                 # Design documents (Chinese & English)
├── public/              # Static assets and PWA icons
├── vite.config.js       # Vite + PWA configuration
└── package.json         # Dependencies and scripts
```

## Key Features to Implement

**MVP Core Features:**
1. Restaurant management system with 5-tier rating system
2. "给我食物!" (Gimme Food) magic button with abstract question system
3. Intelligent weighted selection algorithm
4. Progressive re-selection flow (3-step escalation)
5. Post-meal feedback system for algorithm learning
6. Chinese language interface throughout

**Algorithm Requirements:**
- Tier-based weighting with automatic demotion on rejection
- Recent selection penalty (temporary tier reduction)
- Abstract questions that influence selection (adventure vs comfort)
- Cross-tier selection when higher tiers exhausted

## PWA Configuration

The app is configured as a PWA with:
- Manifest name: "Gimme Food - Meal Picker"
- Theme color: #3B82F6 (blue)
- Offline capability via service worker
- Installable on mobile/desktop devices
- Icons: 192x192 and 512x512 PNG formats expected in /public

## Data Model

**Restaurant Object Structure:**
- name (餐厅名称)
- tier (等级): 夯/顶级/人上人/NPC/拉完了
- mealTypes (适用餐点): 早餐/午餐/晚餐/零食
- weight (动态权重 - algorithm managed)
- lastSelected (最近选择时间)
- feedbackHistory (反馈历史)

## Development Notes

- This is a single-page application with no routing initially
- All strings should be in Chinese for user-facing content
- Focus on mobile-first responsive design
- Implement offline-first data persistence strategy
- No external API dependencies in MVP - pure client-side logic