import {
  Component,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
} from '@angular/core'
import { trigger, style, animate, transition } from '@angular/animations'
import { scaleBand, scaleLinear } from 'd3-scale'

import {
  calculateViewDimensions,
  ViewDimensions,
  ColorHelper,
  BaseChartComponent,
  getUniqueXDomainValues,
  getScaleType,
} from '@swimlane/ngx-charts'

@Component({
  selector: 'ha4us-bar-vertical-time',
  templateUrl: './bar-vertical-time.component.html',
  styleUrls: ['./bar-vertical-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1,
          transform: '*',
        }),
        animate(500, style({ opacity: 0, transform: 'scale(0)' })),
      ]),
    ]),
  ],
})
export class BarVerticalTimeComponent extends BaseChartComponent {
  @Input() legend = false
  @Input() legendTitle = 'Legend'
  @Input() legendPosition = 'right'
  @Input() xAxis
  @Input() yAxis
  @Input() showXAxisLabel
  @Input() showYAxisLabel
  @Input() xAxisLabel
  @Input() yAxisLabel
  @Input() tooltipDisabled = false
  @Input() scaleType = 'ordinal'
  @Input() gradient: boolean
  @Input() showGridLines = true
  @Input() activeEntries: any[] = []
  @Input() schemeType: string
  @Input() trimXAxisTicks = true
  @Input() trimYAxisTicks = true
  @Input() maxXAxisTickLength = 16
  @Input() maxYAxisTickLength = 16
  @Input() xAxisTickFormatting: any
  @Input() yAxisTickFormatting: any
  @Input() xAxisTicks: any[]
  @Input() yAxisTicks: any[]
  @Input() groupPadding = 16
  @Input() barPadding = 8
  @Input() roundDomains = false
  @Input() roundEdges = true
  @Input() yScaleMax: number
  @Input() showDataLabel = false
  @Input() dataLabelFormatting: any

  @Output() activate: EventEmitter<any> = new EventEmitter()
  @Output() deactivate: EventEmitter<any> = new EventEmitter()

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>

  dims: ViewDimensions
  groupDomain: any[]
  innerDomain: any[]
  valuesDomain: any[]
  groupScale: any
  innerScale: any
  valueScale: any
  transform: string
  colors: ColorHelper
  margin = [10, 20, 10, 20]
  xAxisHeight = 0
  yAxisWidth = 0
  legendOptions: any
  dataLabelMaxHeight: any = { negative: 0, positive: 0 }

  update(): void {
    super.update()

    if (!this.showDataLabel) {
      this.dataLabelMaxHeight = { negative: 0, positive: 0 }
    }
    this.margin = [
      10 + this.dataLabelMaxHeight.positive,
      20,
      10 + this.dataLabelMaxHeight.negative,
      20,
    ]

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType,
      legendPosition: this.legendPosition,
    })

    if (this.showDataLabel) {
      this.dims.height -= this.dataLabelMaxHeight.negative
    }

    this.formatDates()

    this.groupDomain = this.getGroupDomain()
    this.innerDomain = this.getInnerDomain()
    this.valuesDomain = this.getValueDomain()

    this.groupScale = this.getGroupScale()
    this.innerScale = this.getInnerScale()
    this.valueScale = this.getValueScale()

    this.setColors()
    this.legendOptions = this.getLegendOptions()

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0] +
      this.dataLabelMaxHeight.negative})`
  }

  onDataLabelMaxHeightChanged(event, groupIndex) {
    if (event.size.negative) {
      this.dataLabelMaxHeight.negative = Math.max(
        this.dataLabelMaxHeight.negative,
        event.size.height
      )
    } else {
      this.dataLabelMaxHeight.positive = Math.max(
        this.dataLabelMaxHeight.positive,
        event.size.height
      )
    }
    if (groupIndex === this.results.length - 1) {
      setTimeout(() => this.update())
    }
  }

  getGroupScale(): any {
    const spacing =
      this.groupDomain.length / (this.dims.height / this.groupPadding + 1)

    return scaleBand()
      .rangeRound([0, this.dims.width])
      .paddingInner(spacing)
      .paddingOuter(spacing / 2)
      .domain(this.groupDomain)
  }

  getInnerScale(): any {
    const width = this.groupScale.bandwidth()
    const spacing = this.innerDomain.length / (width / this.barPadding + 1)
    return scaleBand()
      .rangeRound([0, width])
      .paddingInner(spacing)
      .domain(this.innerDomain)
  }

  getValueScale(): any {
    const scale = scaleLinear()
      .range([this.dims.height, 0])
      .domain(this.valuesDomain)
    return this.roundDomains ? scale.nice() : scale
  }

  getGroupDomain() {
    const domain = []
    for (const group of this.results) {
      if (!domain.includes(group.name)) {
        domain.push(group.name)
      }
    }

    return domain
  }

  getInnerDomain() {
    const domain = []
    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.name)) {
          domain.push(d.name)
        }
      }
    }

    return domain
  }

  getValueDomain() {
    const domain = []
    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.value)) {
          domain.push(d.value)
        }
      }
    }

    const min = Math.min(0, ...domain)
    const max = this.yScaleMax
      ? Math.max(this.yScaleMax, ...domain)
      : Math.max(0, ...domain)

    return [min, max]
  }

  groupTransform(group) {
    return `translate(${this.groupScale(group.name)}, 0)`
  }

  onClick(data, group?) {
    if (group) {
      data.series = group.name
    }

    this.select.emit(data)
  }

  trackBy(index, item) {
    return item.name
  }

  setColors(): void {
    let domain
    if (this.schemeType === 'ordinal') {
      domain = this.innerDomain
    } else {
      domain = this.valuesDomain
    }

    this.colors = new ColorHelper(
      this.scheme,
      this.schemeType,
      domain,
      this.customColors
    )
  }

  getLegendOptions() {
    const opts = {
      scaleType: this.schemeType,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.legendPosition,
    }
    if (opts.scaleType === 'ordinal') {
      opts.domain = this.innerDomain
      opts.colors = this.colors
      opts.title = this.legendTitle
    } else {
      opts.domain = this.valuesDomain
      opts.colors = this.colors.scale
    }

    return opts
  }

  updateYAxisWidth({ width }) {
    this.yAxisWidth = width
    this.update()
  }

  updateXAxisHeight({ height }) {
    this.xAxisHeight = height
    this.update()
  }

  onActivate(event, group?) {
    const item = Object.assign({}, event)
    if (group) {
      item.series = group.name
    }

    const idx = this.activeEntries.findIndex(d => {
      return (
        d.name === item.name &&
        d.value === item.value &&
        d.series === item.series
      )
    })
    if (idx > -1) {
      return
    }

    this.activeEntries = [item, ...this.activeEntries]
    this.activate.emit({ value: item, entries: this.activeEntries })
  }

  onDeactivate(event, group?) {
    const item = Object.assign({}, event)
    if (group) {
      item.series = group.name
    }

    const idx = this.activeEntries.findIndex(d => {
      return (
        d.name === item.name &&
        d.value === item.value &&
        d.series === item.series
      )
    })

    this.activeEntries.splice(idx, 1)
    this.activeEntries = [...this.activeEntries]

    this.deactivate.emit({ value: item, entries: this.activeEntries })
  }
}
