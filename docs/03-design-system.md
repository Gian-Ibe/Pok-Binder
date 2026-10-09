# Design System

## Colors
The application's colors are defined in `client/src/styles.css` using CSS custom properties. Each color should have a consistent name and hex value.

## Typography
Font families and text sizes are defined in `client/src/styles.css`. Text sizes should be used consistently across headings, body text, labels, and buttons.

## Spacing
Spacing is managed through CSS rules in `client/src/styles.css`. Consistent spacing is used for margins, padding, gaps, and component layouts.

## Components
Reusable interface elements include buttons, form fields, cards, and navigation elements. Their styles are maintained in `client/src/styles.css`, including hover, focus, disabled, and loading states where applicable.

## Interface States
The application should handle:
- **Loading:** Data is being retrieved.
- **Empty:** No cards have been added.
- **Error:** Data could not be loaded or an action failed.
- **Data:** Cards are displayed in the collection.