import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'

const TEXT_Y_OFFSET = 15
const IMAGE_HEIGHT = 10
const FONT_FAMILY = 'sans-serif'

export class GeneSetLegend extends PureComponent {


  render() {

    const precision = this.props.precision!==undefined ? this.props.precision : 2
    const formattedMin = isNaN(this.props.minScore) ? this.props.minScore : this.props.minScore.toFixed(precision)
    const formattedMax = isNaN(this.props.maxScore) ? this.props.maxScore : this.props.maxScore.toFixed(precision)

    const label = this.props.label
    const labelLength = label ? label.length * 9 : 0

    const maxColor = this.props.maxColor ? this.props.maxColor : 'red'
    const midColor = this.props.midColor ? this.props.midColor : 'white'
    const minColor = this.props.minColor ? this.props.minColor : 'blue'



    const fillURL = `url(#${this.props.id})`
    return (
      <svg height="20" width="100%">
        <defs>
          <linearGradient id={this.props.id}>
            <stop offset="0%" stopColor={maxColor} />
            <stop offset="50%" stopColor={midColor} />
            <stop offset="100%" stopColor={minColor} />
          </linearGradient>
        </defs>
        {label &&
        <text fontFamily={FONT_FAMILY} height={20} width={labelLength} x={0} y={TEXT_Y_OFFSET}>
          {label}
        </text>
        }
        <text fontFamily={FONT_FAMILY} height={20} width={20} x={labelLength} y={TEXT_Y_OFFSET}>
          {formattedMax}
        </text>
        <rect fill={fillURL} height={IMAGE_HEIGHT} width={50} x={labelLength+40} y={5}/>
        <text fontFamily={FONT_FAMILY} height={10} width={300} x={labelLength+100} y={TEXT_Y_OFFSET}>
          {formattedMin}
        </text>
      </svg>
    )
  }

}

GeneSetLegend.propTypes = {
  id: PropTypes.any.isRequired,
  label: PropTypes.any,
  maxColor: PropTypes.any,
  maxScore: PropTypes.any.isRequired,
  midColor: PropTypes.any,
  minColor: PropTypes.any,
  minScore: PropTypes.any.isRequired,
  precision: PropTypes.any,
}
