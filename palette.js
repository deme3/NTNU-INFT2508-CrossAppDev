export const baseColors = {
  red: '#ff4e4f',
  aqua: '#00b591',
  blue: '#4280ff',
  white: '#FFFFFF',
  black: '#212121',
  gray: '#9E9E9E',
  lightgray: '#EEEEEE',
  shadow: '#000000'
}

const colors = {
  light: {
    text: baseColors.black,
    contrastText: baseColors.white,
    mainBackground: baseColors.white,
    placeholder: baseColors.gray,
    tabSelected: baseColors.blue,
    cardBackground: baseColors.white,
    searchInputBackground: baseColors.lightgray,
    searchInputForeground: baseColors.black,
    listDivider: baseColors.black + "40",
    listUnderlay: baseColors.black + "10",
  },
  dark: {
    text: baseColors.white,
    contrastText: baseColors.white,
    mainBackground: baseColors.black,
    placeholder: baseColors.gray,
    tabSelected: baseColors.blue,
    cardBackground: baseColors.black,
    searchInputBackground: "#000",
    searchInputForeground: baseColors.white,
    listDivider: "#00000045",
    listUnderlay: "#00000045"
  }
}
export default class Palette {
  static currentPalette = 'light';
  static setPalette(newStyle) {
    let oldStyle = Palette.currentPalette;
    Palette.currentPalette = newStyle;
    
    for(let key of Object.keys(colors[oldStyle]))
      if(Palette[key]) delete Palette[key];

    let newProperties = {};
    for(let key of Object.keys(colors[newStyle])) {
      newProperties[key] = {
        value: colors[newStyle][key],
        writable: false,
        configurable: true,
      };
    }

    
    Object.defineProperties(Palette, newProperties);
  }

  /**
   * Get color from current palette setting
   * @param {'text' | 'placeholder' | 'tabSelected' | 'cardBackground'} colorName 
   * @returns {string}
   */
  static get(colorName) {
    return colors[Palette.currentPalette][colorName];
  }
};

Palette.setPalette('light'); // First initialisation of properties