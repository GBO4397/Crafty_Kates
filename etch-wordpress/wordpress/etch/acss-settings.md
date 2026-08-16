# Automatic.css project values

Configure these in the ACSS dashboard before applying Etch styles. ACSS remains the source of truth; the custom stylesheet consumes its variables.

| ACSS role | Value | Purpose |
|---|---:|---|
| Primary | `#9e065d` | Crafty Kates wine |
| Secondary | `#fb50b1` | Bright pink accent |
| Base | `#1a0a12` | Ink/dark surfaces |
| Neutral | `#75656d` | Muted text and dividers |
| Light background | `#fffaf2` | Cream sections |
| Ultra-light background | `#fff2f7` | Blush sections |
| Content width | `1200px` | Main content container |
| Body font | Roboto | Body and controls |
| Heading font | Bebas Neue | Display headings |
| Radius | `1.15rem` | Cards and panels |

Enable Primary, Secondary, Base, Neutral, Success, Danger, Warning, and Info. Keep ACSS's fluid type and spacing scales enabled. Use `.bg--dark`, `.bg--ultra-light`, `.text--light`, `.grid--auto-*`, `.grid-gap`, `.btn--primary`, and `.btn--secondary` utilities in Etch; use semantic `ck-*` classes for reusable components.
