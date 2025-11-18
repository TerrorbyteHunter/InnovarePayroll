# Innovare Payroll - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from modern SaaS productivity tools (Linear, Notion, Asana) combined with enterprise data application patterns (Stripe Dashboard, Vercel). This approach prioritizes clarity, efficiency, and data density while maintaining a professional, trustworthy aesthetic suitable for financial software.

## Typography System

**Font Stack**: Inter (primary) via Google Fonts CDN
- **Headings**: 
  - H1: text-3xl font-semibold (Dashboard titles, page headers)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-lg font-semibold (Card/panel headers)
  - H4: text-base font-medium (Subsection labels)
- **Body Text**: text-sm font-normal (Default for all content, tables, forms)
- **Labels**: text-xs font-medium uppercase tracking-wide (Form labels, table headers)
- **Data/Numbers**: text-base font-mono (Monetary values, IDs, calculations)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Page margins: px-6 to px-8

**Grid Structure**:
- Main sidebar: w-64 fixed left
- Content area: Dynamic width with max-w-7xl container
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Data tables: Full width with horizontal scroll
- Forms: max-w-2xl for single-column, grid-cols-2 for multi-column

## Component Library

### Navigation
**Sidebar Navigation** (Fixed left, full height):
- Logo at top (h-16)
- Grouped menu items with icons from Heroicons (outline style)
- Active state: Distinct treatment with subtle background
- User profile/settings at bottom
- Collapsible on mobile

**Top Bar** (Across content area):
- Breadcrumb navigation
- Quick actions (Run Payroll, Add Employee)
- Notifications bell
- User avatar dropdown

### Core Components

**Data Tables**:
- Sticky header row
- Alternating row treatment for readability
- Action column (right-aligned) with icon buttons
- Inline editing capability for certain fields
- Pagination footer
- Filter/search bar above table

**Cards/Panels**:
- Rounded corners (rounded-lg)
- Consistent padding (p-6)
- Header with title and optional action button
- Divider between header and content

**Forms**:
- Clear label hierarchy
- Input fields with consistent height (h-10)
- Required field indicators
- Inline validation messages
- Multi-step wizard pattern for payroll runs
- Group related fields with subtle borders/backgrounds

**Buttons**:
- Primary: Solid fill, font-medium
- Secondary: Outline style
- Destructive: Reserved for delete/critical actions
- Icon buttons: Square (h-9 w-9) for table actions
- All buttons: rounded-md, consistent height (h-9 to h-10)

**Status Badges**:
- Small rounded-full pills
- For payroll status (Draft, Processing, Approved, Locked)
- For leave requests (Pending, Approved, Rejected)
- Text: text-xs font-medium

### Data Display

**Stat Cards** (Dashboard):
- Large numbers (text-2xl font-bold)
- Label underneath (text-sm)
- Optional trend indicator with small arrow icon
- Compact layout (p-4 to p-6)

**Timeline/Activity Feed**:
- Vertical line connecting items
- Icon bullets
- Timestamp and user info (text-xs)
- Grouped by date

**Progress Indicators**:
- Stepped progress for payroll wizard
- Linear progress bars for processing states
- Percentage displays for completion

### Specialized Components

**Payslip Preview**:
- Two-column layout (employee info left, company right)
- Table for earnings/deductions
- Clear totals section
- PDF download button prominent

**Statutory Breakdown Panel**:
- Tabular layout for PAYE/NAPSA/NHIMA calculations
- Formula display capability
- Expandable detail rows

**Report Generator**:
- Filter panel (left sidebar)
- Preview area (main)
- Export options (top right)

## Accessibility

- All interactive elements: min-h-9 for touch targets
- Form inputs: Proper label associations with htmlFor
- Tables: thead with proper scope attributes
- Icon buttons: aria-label on all icon-only buttons
- Keyboard navigation: Focus visible styles on all interactive elements
- Skip to content link for keyboard users

## Layout Patterns

**Dashboard**: 4-column stat cards grid → Recent activity + Pending approvals (2-column) → Upcoming deadlines list

**Employee List**: Search/filter bar → Data table with pagination → Bulk action toolbar

**Payroll Run Wizard**: 
- Step indicator header
- Content area (max-w-3xl centered)
- Navigation footer (Previous/Next)
- Steps: Select Period → Review Employees → Preview Calculations → Approve → Generate

**Report Pages**: Filter sidebar (w-72) → Main report view with export header

## Icons
**Heroicons (outline)** via CDN for all interface icons:
- Navigation: home, users, calculator, document, calendar, cog
- Actions: plus, pencil, trash, download, upload, check, x
- Status: check-circle, x-circle, clock, lock

## Animations
Minimal, functional only:
- Dropdown menus: Simple fade-in
- Modal overlays: Gentle scale + fade
- Loading states: Subtle spinner
- NO scroll animations, parallax, or decorative motion

## Images
No hero images or marketing imagery needed. This is a data-focused application. Potential use:
- Company logo placeholder in sidebar
- User avatars in profile areas (circular, w-8 h-8 to w-10 h-10)
- Empty state illustrations for zero-data scenarios (optional, simple line art)