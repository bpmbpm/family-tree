Не понял https://github.com/bpmbpm/family-tree/pull/81

## Summary

Implements all features from issue #80:

**PDF Export Fix:**
- Fixed PDF export to include mini photos (minifoto) in the exported document
- Photos are now converted to base64 data URLs before SVG serialization
- This ensures images are embedded directly in the SVG, making them visible when converted to canvas for PDF generation
- Added progress status "Loading images..." during image conversion phase

**Technical Details:**
- Added `imageUrlToBase64()` function to load images and convert them to base64 data URLs
- Added `embedImagesInSvg()` function to process all `<image>` elements in the SVG
- Clone SVG before modification to preserve the original diagram
- Handles both `href` and `xlink:href` attributes for cross-browser compatibility

**Documentation Update (new_person_parameters_v1.md):**

Added analysis section answering the questions from the issue:

1. **Why NOT to duplicate spouse in multiple clusters:**
   - Violates the unique ID principle ("one person = one node")
   - Breaks graph connectivity between parents and children
   - Increases diagram size unnecessarily
   - Complicates search and filtering
   - Has Graphviz technical limitations with multiple cluster membership

2. **Why NOT to show endReason_ in cluster label:**
   - Information overload in visual labels
   - Semantic mismatch (cluster = marriage, not its end)
   - Often redundant (can be inferred from death dates)
   - Privacy concerns for sensitive information (divorces)
   - Recommendation: show only in properties panel on click

## Test plan
- [ ] Load tree.xlsx and verify the tree displays correctly with photos
- [ ] Click "pdf" button → verify PDF downloads with photos visible
- [ ] Verify photos appear correctly in the exported PDF (not blank/missing)
- [ ] Read updated documentation and verify analysis is clear and complete

Fixes bpmbpm/family-tree#80

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
