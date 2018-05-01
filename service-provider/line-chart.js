// Adjusted from: https://codepen.io/stefanjudis/pen/gkHwJ

/* global d3 */

const DURATION = 100;

/**
 * Draw the fancy line chart.
 *
 * @param {string} elementId elementId
 * @param {array} data data
 */
function drawLineChart(elementId, data) { // eslint-disable-line no-unused-vars
  const containerEl = document.getElementById(elementId);
  const width = containerEl.clientWidth;
  const height = width * 0.4;
  const margin = {
    top: 30,
    right: 10,
    left: 10,
  };

  const detailWidth = 98;
  const detailHeight = 55;
  const detailMargin = 10;

  const container = d3.select(containerEl);

  // Cleanup previous drawing
  container.select('svg').selectAll('g,path,text,tspan').remove();

  const svg = container.select('svg')
    .attr('width', width)
    .attr('height', height + margin.top);

  const x = d3.time.scale().range([0, width - detailWidth]);
  const xAxis = d3.svg.axis().scale(x)
    .ticks(8)
    .tickSize(-height);
  const xAxisTicks = d3.svg.axis().scale(x)
    .ticks(16)
    .tickSize(-height)
    .tickFormat('');
  const y = d3.scale.linear().range([height, 0]);
  const yAxis = d3.svg.axis().scale(y)
    .orient('left')
    .ticks(6)
    .tickSize(-width);
  const yAxisTicks = d3.svg.axis().scale(y)
    .ticks(12)
    .tickSize(width)
    .tickFormat('')
    .orient('right');

  const area = d3.svg.area()
    .interpolate('linear')
    .x(d => x(d.date) + (detailWidth / 2))
    .y0(height)
    .y1(d => y(d.value));

  const line = d3.svg.line()
    .interpolate('linear')
    .x(d => x(d.date) + (detailWidth / 2))
    .y(d => y(d.value));

  const startData = data.map(datum => ({
    date: datum.date,
    value: 0,
  }));

  let circleContainer;

  // Compute the minimum and maximum date, and the maximum value.
  x.domain([data[0].date, data[data.length - 1].date]);
  // hacky hacky hacky :(
  y.domain([0, d3.max(data, d => d.value) * 2]);

  svg.append('g')
    .attr('class', 'line-chart-x-axis-ticks')
    .attr('transform', `translate(${detailWidth / 2}, ${height})`)
    .call(xAxisTicks);

  svg.append('g')
    .attr('class', 'line-chart-x-axis')
    .attr('transform', `translate(${detailWidth / 2}, ${height + 7})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'line-chart-y-axis')
    .attr('transform', `translate(${40})`)
    .call(yAxis);

  svg.append('g')
    .attr('class', 'line-chart-y-axis-ticks')
    .attr('transform', `translate(${40})`)
    .call(yAxisTicks);


  // Helper functions!!!

  function hideCircleDetails() {
    circleContainer.selectAll('.line-chart-bubble')
      .remove();
  }

  function showCircleDetail(d) {
    const details = circleContainer.append('g')
      .attr('class', 'line-chart-bubble')
      .attr(
        'transform',
        () => {
          let result = 'translate(';

          result += x(d.date);
          result += ', ';
          result += y(d.value) - detailHeight - detailMargin;
          result += ')';

          return result;
        },
      );

    details.append('path')
      .attr('d', 'M2.99990186,0 C1.34310181,0 0,1.34216977 0,2.99898218 L0,47.6680579 C0,49.32435 1.34136094,50.6670401 3.00074875,50.6670401 L44.4095996,50.6670401 C48.9775098,54.3898926 44.4672607,50.6057129 49,54.46875 C53.4190918,50.6962891 49.0050244,54.4362793 53.501875,50.6670401 L94.9943116,50.6670401 C96.6543075,50.6670401 98,49.3248703 98,47.6680579 L98,2.99898218 C98,1.34269006 96.651936,0 95.0000981,0 L2.99990186,0 Z M2.99990186,0')
      .attr('width', detailWidth)
      .attr('height', detailHeight);

    const text = details.append('text')
      .attr('class', 'line-chart-bubble-text');

    text.append('tspan')
      .attr('class', 'line-chart-bubble-label')
      .attr('x', detailWidth / 2)
      .attr('y', detailHeight / 3)
      .attr('text-anchor', 'middle')
      .text('Usage (Wh): ');

    text.append('tspan')
      .attr('class', 'line-chart-bubble-value')
      .attr('x', detailWidth / 2)
      .attr('y', (detailHeight / 4) * 3)
      .attr('text-anchor', 'middle')
      .text(d.value);
  }

  function drawCircle(datum, index) {
    circleContainer.datum(datum)
      .append('circle')
      .attr('class', 'line-chart-circle')
      .attr('r', 0)
      .attr('cx', d => x(d.date) + (detailWidth / 2))
      .attr('cy', d => y(d.value))
      .on('mouseenter', function onMouseEnter(d) {
        d3.select(this)
          .attr(
            'class',
            'line-chart-circle line-chart-circle-highlighted',
          )
          .attr('r', 7);

        d.active = true; // eslint-disable-line no-param-reassign

        showCircleDetail(d);
      })
      .on('mouseout', function onMouseOut(d) {
        d3.select(this)
          .attr(
            'class',
            'line-chart-circle',
          )
          .attr('r', 6);

        if (d.active) {
          hideCircleDetails();

          d.active = false; // eslint-disable-line no-param-reassign
        }
      })
      .on('click touch', (d) => {
        if (d.active) {
          showCircleDetail(d);
        } else {
          hideCircleDetails();
        }
      })
      .transition()
      .delay(DURATION / (10 * index))
      .attr('r', 6);
  }

  function drawCircles(d) {
    circleContainer = svg.append('g');

    d.forEach((datum, index) => drawCircle(datum, index));
  }

  function tween(b, callback) {
    return (a) => {
      const i = d3.interpolateArray(a, b);

      return t => callback(i(t));
    };
  }

  // Add the line path.
  svg.append('path')
    .datum(startData)
    .attr('class', 'line-chart-area-line')
    .attr('d', line)
    .transition()
    .duration(DURATION)
    .delay(DURATION / 2)
    .attrTween('d', tween(data, line))
    .each('end', () => {
      drawCircles(data);
    });


  // Add the area path.
  svg.append('path')
    .datum(startData)
    .attr('class', 'line-chart-area')
    .attr('d', area)
    .transition()
    .duration(DURATION)
    .attrTween('d', tween(data, area));
}
