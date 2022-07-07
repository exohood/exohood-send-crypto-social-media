import React from 'react';
import TextToSVG from 'text-to-svg';

export default class App extends React.Component {
  render() {
    const { width, height, translationKey, translate } = this.props;
    const viewBox = [0, 0, width, height].join(' ');
    const attributes = { fill: '#FFFFFF' };
    const textToSVG = TextToSVG.loadSync('./fonts/arial.otf');
    const country = translate(`country.to-${translationKey}`);
    const sendCryptoTo = translate('line1', { country });
    const withExohood = translate('line2');
    const line1 = textToSVG.getPath(sendCryptoTo.toUpperCase(), {
      x: width / 2,
      y: height / 2 - 20,
      fontSize: 40,
      anchor: 'center bottom',
      attributes: attributes,
    });
    const line2 = textToSVG.getPath(withExohood.toUpperCase(), {
      x: width / 2,
      y: height / 2 + 20,
      fontSize: 40,
      anchor: 'center top',
      attributes: attributes,
    });

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={width} height={height}>
        <rect fill="#2E4369" width={width} height={height} />
        <g dangerouslySetInnerHTML={{ __html: line1 }} />
        <g dangerouslySetInnerHTML={{ __html: line2 }} />
      </svg>
    );
  }
}
