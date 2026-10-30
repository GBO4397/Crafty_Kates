# Public behavior map

## Contact and subscription

- Contact fields: name, email, subject, and message.
- Subject values: general inquiry, car-show registration, sponsorship, and media/press.
- Name, valid email, and message are required.
- Successful submissions are stored for admin review.
- Newsletter signup validates email and treats an existing address as an already-subscribed success state.

## Car-show registration

- Entry types: vehicle, vendor, or cackle car.
- Shared fields: name, phone, street address, city, state, ZIP, email, liability agreement, and photo release.
- Vehicle fields: year, make, and model.
- Vendor fields: business name and space size.
- Cackle-car field: vehicle information/description.
- The current public page advertises 2026 pricing and April 18, 2026 event details, while the home-page letter advertises the April 10, 2027 seventh annual event. The rebuild must keep these as admin-editable event settings instead of duplicating dates in templates.

## Community post submission

Three steps are implemented:

1. Author and details: title, author name, email, category, summary, and optional source URL.
2. Content and image: body of at least 50 characters, comma-separated tags, and either an uploaded image or pasted image URL.
3. Review: preview and final submission for moderation.

Categories are feature story, car build, racing, restoration, community, event recap, tech tips, history/nostalgia, and other. New posts use `pending` status and are not public until approved.

## Community event submission

Three steps are implemented:

1. Event details: title, category, description, date, start/end times, location name, full address, free/paid selection, and ticket price when applicable.
2. Contact and flyer: organizer name, email, optional phone, optional flyer image, website URL, and ticket URL.
3. Review and final moderated submission.

Event categories are car show, community event, fundraiser, festival/fair, meetup/cruise, swap meet, and other. Flyers accept JPG, PNG, and WebP up to 5 MB. New events use `pending` status.

## Coloring-book creation

Four steps are implemented:

1. Book details: title, author/artist, email, description, and tags.
2. Covers: required front cover plus optional back, inside-front, and inside-back covers.
3. Pages: at least two JPG/PNG/WebP page images, up to 10 MB each, with editable titles and manual ordering.
4. Review and moderated submission.

Books and pages are stored separately. Covers may be color; interior pages are flagged as line-art pages. Approved books support a flip-book view and browser-generated download/print output.

## Galleries and media

- Home-page photo reel has previous/next controls and opens a lightbox.
- Photographer galleries switch between grid and masonry layout.
- The coloring-book reader supports page navigation and printable/downloadable output.
- The image-archive tool packages hardcoded images into section folders with a README and CSV manifest.
