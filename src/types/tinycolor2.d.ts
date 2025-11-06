declare module 'tinycolor2' {
  interface ColorInput {
    r: number;
    g: number;
    b: number;
    a?: number;
  }

  interface ColorFormats {
    rgb: string;
    prgb: string;
    hex: string;
    hex6: string;
    hex3: string;
    hex4: string;
    hex8: string;
    name: string;
    hsl: string;
    hsv: string;
  }

  interface TinyColorOptions {
    format?: keyof ColorFormats;
    gradientType?: 'linear' | 'radial';
  }

  interface TinyColor {
    /**
     * Get the brightness of the color, from 0-255
     */
    getBrightness(): number;

    /**
     * Get the luminance of the color, from 0-1
     */
    getLuminance(): number;

    /**
     * Returns whether the color is dark
     */
    isDark(): boolean;

    /**
     * Returns whether the color is light
     */
    isLight(): boolean;

    /**
     * Returns the alpha value of the color
     */
    getAlpha(): number;

    /**
     * Sets the alpha value on the current color
     */
    setAlpha(alpha: number): TinyColor;

    /**
     * Returns the color as a hex string
     */
    toHexString(): string;

    /**
     * Returns the color as a hex8 string
     */
    toHex8String(): string;

    /**
     * Returns the color as an RGB string
     */
    toRgbString(): string;

    /**
     * Returns the color as an RGBA string
     */
    toRgb(): ColorInput;

    /**
     * Returns the color as an HSL string
     */
    toHslString(): string;

    /**
     * Returns the color as an HSV string
     */
    toHsvString(): string;

    /**
     * Returns the color as a name string
     */
    toName(): string;

    /**
     * Lighten the color by the given amount
     */
    lighten(amount?: number): TinyColor;

    /**
     * Brighten the color by the given amount
     */
    brighten(amount?: number): TinyColor;

    /**
     * Darken the color by the given amount
     */
    darken(amount?: number): TinyColor;

    /**
     * Desaturate the color by the given amount
     */
    desaturate(amount?: number): TinyColor;

    /**
     * Saturate the color by the given amount
     */
    saturate(amount?: number): TinyColor;

    /**
     * Completely desaturates a color into greyscale
     */
    greyscale(): TinyColor;

    /**
     * Spin the hue by the given amount
     */
    spin(amount: number): TinyColor;

    /**
     * Mix the color with another color
     */
    mix(color: string | ColorInput, amount?: number): TinyColor;

    /**
     * Returns the complement of the color
     */
    complement(): TinyColor;

    /**
     * Returns an analogous color scheme
     */
    analogous(results?: number, slices?: number): TinyColor[];

    /**
     * Returns a monochromatic color scheme
     */
    monochromatic(results?: number): TinyColor[];

    /**
     * Returns a split-complement color scheme
     */
    splitcomplement(): TinyColor[];

    /**
     * Returns a triadic color scheme
     */
    triadic(): TinyColor[];

    /**
     * Returns a tetradic color scheme
     */
    tetradic(): TinyColor[];

    /**
     * Check if the color is valid
     */
    isValid(): boolean;

    /**
     * Returns the string representation of the color
     */
    toString(format?: keyof ColorFormats): string;
  }

  /**
   * TinyColor main function
   */
  function tinycolor(
    color?: string | ColorInput | TinyColor,
    opts?: TinyColorOptions
  ): TinyColor;

  export = tinycolor;
}