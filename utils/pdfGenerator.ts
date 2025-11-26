import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { GameCard } from '../types';

export const generatePDF = async (cards: GameCard[], cardTitle: string) => {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Conversion utility: 1 mm = 2.8346 points
  const mmToPt = (mm: number) => mm * 2.83465;

  // A4 Dimensions in points (210mm x 297mm)
  const pageW = mmToPt(210);
  const pageH = mmToPt(297);
  
  // Card Dimensions
  const cardWidth = mmToPt(90);
  const cardHeight = mmToPt(50);
  
  // Gaps
  const colGap = mmToPt(10);
  const rowGap = mmToPt(15);
  
  // Calculate margins to center the grid on the page
  // Content Width: 2 cards + 1 gap
  const totalContentWidth = (cardWidth * 2) + colGap;
  // Content Height: 4 cards + 3 gaps
  const totalContentHeight = (cardHeight * 4) + (rowGap * 3);
  
  const marginX = (pageW - totalContentWidth) / 2;
  const marginY = (pageH - totalContentHeight) / 2;
  
  const cardsPerPage = 8;
  const stripWidth = mmToPt(10);

  // Iterate over cards
  for (let i = 0; i < cards.length; i++) {
    // Add new page if needed
    let page;
    if (i % cardsPerPage === 0) {
      page = pdfDoc.addPage([pageW, pageH]);
    } else {
      page = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    }

    const cardIndexOnPage = i % cardsPerPage;
    const col = cardIndexOnPage % 2;
    const row = Math.floor(cardIndexOnPage / 2);

    // Calculate coordinates (Top-Left based logic converted to PDF Bottom-Left)
    // Distance from Left
    const x = marginX + col * (cardWidth + colGap);
    
    // Distance from Top
    const topOffset = marginY + row * (cardHeight + rowGap);
    
    // PDF Y is from Bottom. So Y of the card's BOTTOM edge is:
    const y = pageH - topOffset - cardHeight;

    // 1. Draw Card Background (White with Grey Border)
    page.drawRectangle({
      x: x,
      y: y,
      width: cardWidth,
      height: cardHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // 2. Draw Yellow Strip
    page.drawRectangle({
      x: x,
      y: y,
      width: stripWidth,
      height: cardHeight,
      color: rgb(0.98, 0.8, 0.08), // Yellow-400ish
    });

    // 3. Draw Title (Rotated)
    const titleText = cardTitle.trim() || "wiskunde";
    let fontSize = 12;
    let textWidth = helveticaBold.widthOfTextAtSize(titleText, fontSize);
    const maxTextLen = cardHeight - mmToPt(8); // padding safety

    // Scale down font if too long
    while (textWidth > maxTextLen && fontSize > 4) {
        fontSize -= 0.5;
        textWidth = helveticaBold.widthOfTextAtSize(titleText, fontSize);
    }

    // Centering Logic for Rotated Text
    // Rotation is 90 degrees Counter-Clockwise (reading UP).
    // The text baseline will be vertical.
    
    // Horizontal centering relative to the yellow strip:
    // With 90deg rotation, the text baseline sits on the vertical line X.
    // The text glyphs extend to the LEFT (negative X) of the baseline.
    // So the baseline needs to be positioned to the RIGHT of the strip's center.
    // Offset = Half of the Cap Height.
    // Cap height is approx 0.7 * fontSize.
    // We want CenterX = BaselineX - (CapHeight / 2)
    // => BaselineX = CenterX + (CapHeight / 2)
    const centerX = x + (stripWidth / 2);
    const capHeight = fontSize * 0.7; 
    const xText = centerX + (capHeight / 2.2); // 2.2 for a slight optical adjustment
    
    // Vertical centering relative to the card height:
    // Text starts drawing at Y and goes UP.
    // To center: StartY = MiddleY - (TextWidth / 2)
    const yText = y + (cardHeight / 2) - (textWidth / 2);

    page.drawText(titleText, {
      x: xText,
      y: yText,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 4. Draw Concepts
    const contentX = x + stripWidth + mmToPt(5); // 5mm padding from strip
    // Start drawing text from top downwards.
    // PDF Y is bottom-up, so "Top" of content area is y + cardHeight - padding.
    const contentTopY = y + cardHeight - mmToPt(10);
    const lineHeight = mmToPt(8);

    cards[i].concepts.slice(0, 5).forEach((concept, idx) => {
        const textY = contentTopY - (idx * lineHeight);
        
        page.drawText(concept, {
            x: contentX,
            y: textY,
            size: 11,
            font: helveticaBold, // Using bold for concepts too per design
            color: rgb(0.1, 0.1, 0.1),
        });

        // Draw divider lines (optional but nice for 30 Seconds style)
        // Draw line BELOW the text.
        if (idx < 4) {
            const lineY = textY - mmToPt(3);
            page.drawLine({
                start: { x: contentX, y: lineY },
                end: { x: x + cardWidth - mmToPt(5), y: lineY },
                thickness: 0.5,
                color: rgb(0.9, 0.9, 0.9),
            });
        }
    });
  }

  // Save and Download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '30-seconds-cards.pdf';
  link.click();
};