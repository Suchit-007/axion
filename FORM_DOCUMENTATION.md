# Report Incident Form - Documentation

## Form Structure

The incident reporting form has been completely refactored with a clean, professional layout organized into **4 clear sections**:

### SECTION 1: Basic Information 📋

This section captures the core incident details:

#### 1.1 Incident Title (Required)

- **Type**: Text input
- **Max Length**: 100 characters
- **Placeholder**: "E.g., Broken light in hallway"
- **Character Counter**: Shows current/max characters
- **Validation**: Required field
- **Features**:
  - Icon: 📝
  - Smooth focus ring (purple)
  - Hover border animation
  - Character limit display

#### 1.2 Category (Required)

- **Type**: Dropdown select
- **Options**:
  - ⚡ Electricity
  - 💧 Water
  - 🌐 Internet
  - 🏢 Hostel
  - 🗑️ Garbage
  - 💻 IT
  - 🔧 Equipment
- **Default**: Electricity
- **Validation**: Required field
- **Features**:
  - Category icons for visual recognition
  - Smooth dropdown styling
  - Focus ring on selection

#### 1.3 Description (Required)

- **Type**: Textarea
- **Rows**: 4
- **Min Length**: 20 characters
- **Placeholder**: "Describe the issue in detail (minimum 20 characters)..."
- **Character Counter**: Shows current count with minimum requirement
- **Validation**: Required, minimum 20 characters
- **Features**:
  - Icon: 📄
  - No resize allowed (fixed size)
  - Character counter below textarea
  - Smooth focus ring

---

### SECTION 2: Location 📍

Handles automatic location capture with fallback options:

#### 2.1 Location Status Display

**Three possible states:**

1. **Detecting** (Loading state)

   - Icon: 🔄
   - Message: "Detecting your location..."
   - Style: Blue background with blue border
   - Shows while geolocation is processing

2. **Error State**

   - Icon: ❌
   - Message: Custom error message (e.g., "Could not get your location...")
   - Style: Red background with red border
   - Fallback if geolocation fails or is disabled

3. **Success State**
   - Icon: ✅
   - Message: "Location captured"
   - Coordinates: "📍 12.9716°N, 77.5946°E" (formatted with 6 decimals)
   - Style: Green background with green border
   - Shows captured latitude/longitude in monospace font

#### 2.2 Automatic Geolocation

- Uses browser's Geolocation API
- Auto-captures on form load
- Timeout handling
- Permission request if needed

#### 2.3 Manual Fallback

- Currently shows in error state
- Future feature for manual coordinate entry
- Allows users to manually enter coordinates if auto-detection fails

---

### SECTION 3: Priority & Media ⚡

Handles incident priority and media attachments:

#### 3.1 Priority Level (Auto-Detected)

**Auto-Detection Features:**

- Automatically detects priority based on description text
- Updates in real-time as user types
- Keywords trigger priority levels:
  - **Critical**: "critical", "emergency", "fire", "flood", "gas leak", "electrocution"
  - **High**: "urgent", "broken", "not working", "damage", "leak"
  - **Low**: "minor", "small", "cosmetic"
  - **Category-based**: Electricity/Water get "High" priority by default
  - **Default**: Medium priority

**Priority Selection UI:**

- Shows "AUTO-DETECTED" badge/label
- Display: "Priority is automatically detected based on your description, but you can override it"
- Visual indicators with color-coded buttons:
  - 🟢 Low (Green) - `from-blue-500 to-cyan-500`
  - 🟡 Medium (Yellow) - `from-yellow-500 to-orange-500`
  - 🟠 High (Orange) - `from-orange-500 to-red-500`
  - 🔴 Critical (Red) - `from-red-600 to-pink-600`

**Manual Override:**

- Users can click any priority button to override auto-detected value
- Clicked button shows gradient background with shadow
- Unselected buttons show semi-transparent background

#### 3.2 Image Upload (Coming Soon)

- **Type**: Drag-and-drop file input area
- **Status**: Coming soon placeholder
- **Design**:
  - Dashed border (white/20)
  - Icon: 📷
  - Messages:
    - "Drag and drop images here or click to select"
    - "Coming soon - Currently supports images in incident reports"
  - Hover effect: Border becomes brighter
  - Size: Full width with generous padding (p-8)

---

### SECTION 4: Buttons (Action Footer)

Two buttons at the bottom of the form:

#### 4.1 Submit Button (Primary)

- **Label**: "Submit Incident" with 🚀 icon
- **Type**: Submit (type="submit")
- **Style**: Gradient button (purple to indigo)
- **Width**: Flex-1 (takes available space)
- **States**:
  - **Normal**: Gradient from-purple-600 to-indigo-600
  - **Hover**: Brighter gradient from-purple-700 to-indigo-700, scales up 5%, adds shadow
  - **Active**: Scales down 5% (active:scale-95)
  - **Loading**: Shows spinner and "Submitting..." or "Checking..."
  - **Disabled**: 50% opacity when:
    - `loading` is true
    - `location` is null (location not captured)
    - `checkingDuplicate` is true

#### 4.2 Cancel Button (Secondary)

- **Label**: "Cancel"
- **Type**: Link (navigates to /dashboard)
- **Style**: Border button (white/20 border)
- **Width**: Fixed width with px-6
- **States**:
  - **Normal**: Semi-transparent white border
  - **Hover**: Light background (white/5), brighter border (white/40), scales up 5%
  - **Active**: Normal appearance

---

## Form State Management

### State Variables

```javascript
const [formData, setFormData] = useState({
  title: "", // String (max 100 chars)
  category: "electricity", // One of 7 categories
  description: "", // String (min 20 chars)
  priority: "medium", // One of 4 priorities
  images: [], // Array of image strings (future)
});

const [loading, setLoading] = useState(false); // Submit in progress
const [checkingDuplicate, setCheckingDuplicate] = useState(false); // Checking duplicates
const [location, setLocation] = useState(null); // { lat, lng }
const [locationError, setLocationError] = useState(""); // Error message
const [duplicateWarning, setDuplicateWarning] = useState(""); // Duplicate alert
```

---

## Form Validation

### Field-Level Validation

| Field       | Type     | Required | Min/Max      | Rules                         |
| ----------- | -------- | -------- | ------------ | ----------------------------- |
| Title       | Text     | ✅ Yes   | 1-100 chars  | Required, max length enforced |
| Category    | Select   | ✅ Yes   | -            | One of 7 options required     |
| Description | Textarea | ✅ Yes   | 20-unlimited | Required, minimum 20 chars    |
| Priority    | Select   | ❌ No    | -            | Auto-detected, can override   |
| Location    | GPS      | ✅ Yes   | -            | Required for submission       |

### Form-Level Validation

Before submission:

1. All required fields filled
2. Location captured (lat/lng)
3. Description at least 20 characters
4. Not currently loading or checking duplicates

---

## Form Logic

### 1. Priority Auto-Detection

- Runs when `description` or `category` changes
- Uses `detectPriority()` function
- Checks keywords in description text
- Updates form state in real-time
- User can always override by clicking priority button

### 2. Duplicate Detection

- Runs when `location`, `category`, or `title` changes
- Uses `/api/incidents/duplicate` endpoint
- Checks for similar incidents within 100m radius
- Debounced with 500ms delay
- Shows warning if duplicate found
- Does not prevent submission

### 3. Geolocation Capture

- Runs on component mount (useEffect)
- Uses `navigator.geolocation.getCurrentPosition()`
- Shows loading state while detecting
- Shows error state if permission denied or timeout
- Captures both latitude and longitude

### 4. Form Submission

- On submit:
  1. Validate all required fields
  2. Check user is authenticated
  3. Check location captured
  4. Send POST to `/api/incidents`
  5. Show success toast and redirect to `/incidents`
  6. Show error toast if submission fails

---

## Styling Details

### Colors & Gradients

- **Background**: from-slate-950 via-purple-950 to-slate-950
- **Cards**: bg-white/5 with backdrop-blur-xl
- **Borders**: border-white/10 (normal), border-white/20 (hover)
- **Focus Ring**: focus:ring-2 focus:ring-purple-500
- **Priority Colors**:
  - Low: from-blue-500 to-cyan-500
  - Medium: from-yellow-500 to-orange-500
  - High: from-orange-500 to-red-500
  - Critical: from-red-600 to-pink-600

### Spacing

- **Form padding**: p-8
- **Section gaps**: mb-8
- **Field spacing**: space-y-6
- **Button gap**: gap-4
- **Divider margin**: mb-8

### Border Radius

- **Inputs**: rounded-lg
- **Dropdowns**: rounded-lg
- **Dividers**: None (just a line)
- **Status boxes**: rounded-lg

### Text Sizing

- **Section titles**: text-xl font-bold
- **Labels**: text-sm font-semibold
- **Helper text**: text-xs text-white/50
- **Placeholders**: text-white/40

---

## Responsive Design

### Mobile (< 640px)

- Single column layout
- Category dropdown (not buttons)
- Full-width buttons (stacked vertically if needed)
- Reduced padding on smaller screens
- Readable font sizes maintained

### Tablet (640px - 1024px)

- Category dropdown
- Buttons side-by-side
- Comfortable spacing
- Good balance of spacing

### Desktop (1024px+)

- Category dropdown
- Full form with all sections visible
- Optimal spacing and sizing
- Maximum width: 2xl (42rem)

---

## Error Handling

### Location Errors

- Geolocation not supported
- Permission denied
- Position unavailable
- Timeout
- Network error

**Display**: Red error box with message and ❌ icon

### Form Validation Errors

- Missing required fields
- Description too short
- Invalid category
- Location not captured

**Display**: Toast notification or form validation

### API Errors

- Network failure
- Server error (5xx)
- Duplicate incident
- Invalid data

**Display**: Error toast with message

---

## Accessibility Features

- ✅ Proper `<label>` elements for all inputs
- ✅ Required field indicators (\*)
- ✅ Focus ring styling (focus:ring-2)
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG AA
- ✅ Icon + text for clarity
- ✅ Error messages in alt text
- ✅ Character counter for guidance

---

## Performance Optimizations

- ✅ Debounced duplicate checking (500ms)
- ✅ Memoized icon/color mapping
- ✅ Efficient state updates
- ✅ CSS animations on GPU (transforms)
- ✅ Minimal re-renders
- ✅ Lazy geolocation (on mount only)

---

## Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Geolocation requires HTTPS or localhost

---

## Future Enhancements

- [ ] Implement image upload/drag-drop
- [ ] Manual coordinate entry fallback
- [ ] Rich text editor for description
- [ ] Location map preview
- [ ] Photo capture on mobile
- [ ] Voice-to-text for description
- [ ] Form auto-save to localStorage
- [ ] Batch report creation
- [ ] Template/preset reports

---

## Testing Scenarios

### Happy Path

1. User enters title
2. System auto-detects priority
3. Location captures successfully
4. User submits form
5. Success message shown
6. Redirected to incidents list

### Error Scenarios

1. Location permission denied
2. Invalid form data
3. Duplicate incident detected
4. Network error during submission
5. Missing required fields

### Edge Cases

1. Very long title (truncated at 100)
2. Very short description (validation fails)
3. Special characters in title
4. Slow network connection
5. Geolocation timeout

---

**Form Status**: ✅ Production Ready
**Last Updated**: November 22, 2025
