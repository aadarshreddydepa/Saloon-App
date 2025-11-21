// Font configuration for the app
// Playfair Display - For headings and titles
// Lora - For body text and normal content

export const fonts = {
  // Headings
  heading: {
    regular: 'PlayfairDisplay_400Regular',
    medium: 'PlayfairDisplay_500Medium',
    semiBold: 'PlayfairDisplay_600SemiBold',
    bold: 'PlayfairDisplay_700Bold',
    extraBold: 'PlayfairDisplay_800ExtraBold',
    black: 'PlayfairDisplay_900Black',
  },
  // Body text
  body: {
    regular: 'Lora_400Regular',
    medium: 'Lora_500Medium',
    semiBold: 'Lora_600SemiBold',
    bold: 'Lora_700Bold',
  },
};

// Helper function to get font family
export const getFontFamily = (type: 'heading' | 'body', weight: keyof typeof fonts.heading | keyof typeof fonts.body = 'regular') => {
  if (type === 'heading') {
    return fonts.heading[weight as keyof typeof fonts.heading] || fonts.heading.regular;
  }
  return fonts.body[weight as keyof typeof fonts.body] || fonts.body.regular;
};
