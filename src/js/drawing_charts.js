var SiteSpeedInTimeChart, VisitsInTimeChart, BarLegendChart, tooltipChart;
var interval = 15;
var speedEvaluateColor = ['#fff59d', '#ffd54f', '#ffb74d', '#ef6c00', '#d84315'];
var chartColors = ['#cbd5cc', '#889995', '#4f3f46', '#4a4d62', '#79829e', '#a8b7d0'];
var activeColor = '#545f69';
var showTooltip = false;
var showSecondTooltip = false;
var groupedDataSet;


function createBarLegendChart(value){
  var configureSeries = function(series, name, i){
    series
      .stroke(null)
      .hoverFill(function(){return this.sourceColor})
      .labels()
        .enabled(true)
        .position('center')
        .fontSize(13)
        .fontColor(anychart.color.darken(anychart.color.darken(speedEvaluateColor[i])))
        .textFormatter(function(){
          return this.seriesName
        });
    series.tooltip(false);
    series.name(name);
  };
  BarLegendChart = anychart.bar();
  BarLegendChart.palette(anychart.palettes.distinctColors().items(speedEvaluateColor));
  BarLegendChart.xAxis().enabled(false);
  BarLegendChart.yAxis().labels().fontSize(10).padding([0,0,0,0]).textFormatter(function(){
    return this.value + 's'
  });
  BarLegendChart.yScale().ticks([0, 0.5, 1, 1.5, 2, 2.5]);
  BarLegendChart.yScale().maximum(2.5);
  BarLegendChart.yScale().minimum(0);
  BarLegendChart.yScale().stackMode('value');
  BarLegendChart.title()
    .enabled(true)
    .fontSize(15)
    .text('Site Speed Evaluation');

  configureSeries(BarLegendChart.bar([0.5]), 'Very Fast', 0);
  configureSeries(BarLegendChart.bar([0.5]), 'Fast', 1);
  configureSeries(BarLegendChart.bar([0.5]), 'Not Fast', 2);
  configureSeries(BarLegendChart.bar([0.5]), 'Slow', 3);
  configureSeries(BarLegendChart.bar([0.5]), 'Very Slow', 4);

  BarLegendChart.padding(20, 70, 0, 70);
  var normalMarker = BarLegendChart.lineMarker();
  normalMarker.value(value);
  normalMarker.stroke('4 ' + activeColor);
  normalMarker.zIndex(50);
  BarLegendChart.textMarker()
    .scale(BarLegendChart.yScale())
    .fontColor(activeColor)
    .rotation(0)
    .offsetX(5)
    .offsetY(20)
    .anchor('leftBottom')
    .value(value)
    .zIndex(55)
    .text('cur. ' + value + 's');

  return BarLegendChart;
}

function drawTooltipChart(){
  tooltipChart = anychart.bar();
  tooltipChart.yScale().minimum(0);
  tooltipChart.yAxis().title().enabled(true).useHtml(true).fontSize(12).margin([10,0,0,0]);
  tooltipChart.yAxis().labels(null);
  tooltipChart.yAxis().ticks(null);
  tooltipChart.yAxis().stroke(null);
  tooltipChart.xAxis().stroke(null);
  tooltipChart.xAxis().labels().fontSize(10).padding([0, 5, 0, 0]);
  tooltipChart.yAxis().drawFirstLabel(false);
  tooltipChart.padding([0, 30, 0, 0]);
  var series = tooltipChart.bar();
  series.tooltip(false).clip(false);
  tooltipChart.barGroupsPadding(0.4);
  tooltipChart.container('container-pages-overview');
  tooltipChart.draw();
}

/**
 * Draw Visits In Time chart
 * @return {object} - chart object
 */
function drawVisitsInTime() {
  VisitsInTimeChart = anychart.column();
  VisitsInTimeChart.yScale().minimum(0);
  VisitsInTimeChart.yAxis().labels().width('35px').fontSize(10);
  VisitsInTimeChart.yAxis().labels().hAlign('right');
  VisitsInTimeChart.yAxis().title('Visits Amount');
  VisitsInTimeChart.yAxis().title().padding(0).margin(0);
  VisitsInTimeChart.yAxis().drawFirstLabel(false);
  var dateScale = anychart.scales.dateTime();
  VisitsInTimeChart.xAxis().labels().textFormatter(function(value) {
    var date = new Date(value['tickValue']);
    var res = date.getHours() + ':' + date.getMinutes();
    return res.replace(':0', ':00')
  });
  VisitsInTimeChart.xAxis().labels().padding([5,0,0,0]);
  VisitsInTimeChart.xScale(dateScale);
  VisitsInTimeChart.xScale().ticks().interval('n', interval*2);
  VisitsInTimeChart.padding([20,70,0,0]);
  VisitsInTimeChart.interactivity("byX");
  VisitsInTimeChart.interactivity().selectionMode("none");
  VisitsInTimeChart.listen('pointsHover', function(evt) {
    var isHovered = evt.seriesStatus.length && evt.seriesStatus[0].points.length;
    if (!isHovered) {
      $('#tooltip_chart_1').hide();
      return;
    }
    showTooltip = true;
    var index = evt.seriesStatus[0].nearestPointToCursor.index;
    var series = evt.target;
    var seriesData = series.getSeries(0).data();
    var chartData = seriesData.get(index, 'pagesData');
    var pointsCount = chartData.length;
    var visitsAmount = 0;
    var avgSpeed = seriesData.get(index, 'speed');
    var speedTitle;
    if (avgSpeed >= 2) speedTitle = 'Very Slow';
    else if (1.5 < avgSpeed && avgSpeed < 2) speedTitle = 'Slow';
    else if (1 < avgSpeed && avgSpeed <= 1.5) speedTitle = 'Not Fast';
    else if (0.5 < avgSpeed && avgSpeed <= 1) speedTitle = 'Fast';
    else if (avgSpeed <= 0.5) speedTitle = 'Very Fast';
    var date = new Date(seriesData.get(index, 'x'));
    var res = date.getHours() + ':' + date.getMinutes();
    $('#tooltip_chart_1 .title .time').html(res.replace(':0', ':00'));
    $('#tooltip_chart_1 .title .resolution').html(speedTitle);
    $('#tooltip_chart_1 .title .speed span').html(avgSpeed);
    for(var i=0; i<pointsCount; i++){
      visitsAmount += chartData[i][1]
    }
    var titleText = '<strong>' + visitsAmount +'</strong> Visits';
    tooltipChart.yAxis().title().text(titleText);

    $('#container-pages-overview').css('height', pointsCount * 25 + 35);
    tooltipChart.getSeries(0).data(chartData).fill(function () {
        if (chartData[this.index]){
          var speed = parseFloat(chartData[this.index][2]/1000);
          if (speed >= 2) return speedEvaluateColor[4] + ' 0.85';
          if (1.5 < speed && speed < 2) return speedEvaluateColor[3] + ' 0.85';
          if (1 < speed && speed <= 1.5) return speedEvaluateColor[2] + ' 0.85';
          if (0.5 < speed && speed <= 1) return speedEvaluateColor[1] + ' 0.85';
          if (speed <= 0.5) return speedEvaluateColor[0] + ' 0.85';
        }
      }).stroke(null).labels()
        .enabled(true)
        .anchor('leftCenter');
    $('#tooltip_chart_1').show();
  });

  VisitsInTimeChart.listen('points', function() {
    showTooltip = false;
    $('#tooltip_chart_1').hide();
  });

  VisitsInTimeChart.listen('mouseMove', function(evt) {
    if (showTooltip)
      $('#tooltip_chart_1').css('top', evt.clientY - 10 - ($('#tooltip_chart_1').height() / 2) ).css('left', evt.clientX + 10)
  });

  VisitsInTimeChart.column()
    .fill(function () {
      if (this.iterator.get('speed')){
        var speed = parseFloat(this.iterator.get('speed'));
        if (speed >= 2) return speedEvaluateColor[4] + ' 0.85';
        if (1.5 < speed && speed < 2) return speedEvaluateColor[3] + ' 0.85';
        if (1 < speed && speed <= 1.5) return speedEvaluateColor[2] + ' 0.85';
        if (0.5 < speed && speed <= 1) return speedEvaluateColor[1] + ' 0.85';
        if (speed <= 0.5) return speedEvaluateColor[0] + ' 0.85';
      }
    })
    .stroke(null)
    .tooltip(false);
  return VisitsInTimeChart
}


/**
 * Draw Site Speed In Time chart
 * @return {object} - chart object
 */
function drawSiteSpeedInTime(value) {
  SiteSpeedInTimeChart = anychart.area();
  SiteSpeedInTimeChart.padding([0,70,0,0]);
  SiteSpeedInTimeChart.yAxis().title('Processing Time');
  SiteSpeedInTimeChart.yAxis().title().padding(0).margin(0);
  SiteSpeedInTimeChart.xAxis().orientation('bottom');
  SiteSpeedInTimeChart.xAxis(1).orientation('top');
  SiteSpeedInTimeChart.palette(chartColors);
  SiteSpeedInTimeChart.tooltip(false);
  SiteSpeedInTimeChart.crosshair().enabled(true).yStroke(null).yLabel(null).xLabel(false);
  SiteSpeedInTimeChart.interactivity().selectionMode("none");

  SiteSpeedInTimeChart.area()
    .name('DNS')
    .stroke(function() { return this.sourceColor + ' 0.6'})
    .fill(function() { return this.sourceColor + ' 0.7'})
    .tooltip(null)
    .hoverMarkers(false)
    .hoverFill(function(){return this.sourceColor});
  SiteSpeedInTimeChart.area()
    .name('Connect')
    .stroke(function() { return this.sourceColor + ' 0.6'})
    .fill(function() { return this.sourceColor + ' 0.7'})
    .tooltip(null)
    .hoverMarkers(false)
    .hoverFill(function(){return this.sourceColor});
  SiteSpeedInTimeChart.area()
    .name('Response')
    .stroke(function() { return this.sourceColor + ' 0.6'})
    .fill(function() { return this.sourceColor + ' 0.7'})
    .tooltip(null)
    .hoverMarkers(false)
    .hoverFill(function(){return this.sourceColor});
  SiteSpeedInTimeChart.area()
    .name('Html Loading')
    .stroke(function() { return this.sourceColor + ' 0.6'})
    .fill(function() { return this.sourceColor + ' 0.7'})
    .hoverMarkers(false)
    .tooltip(null)
    .hoverFill(function(){return this.sourceColor});
  SiteSpeedInTimeChart.area()
    .name('Html Processing').stroke(function() { return this.sourceColor + ' 0.6'})
    .fill(function() { return this.sourceColor + ' 0.7'})
    .tooltip(null)
    .hoverMarkers(false)
    .hoverFill(function(){return this.sourceColor});
  SiteSpeedInTimeChart.area()
    .name('Html Rendering')
    .clip(false)
    .tooltip(null)
    .hoverFill(function(){return this.sourceColor})
    .markers()
    .enabled(true)
    .type('circle');

  SiteSpeedInTimeChart.yScale().stackMode('value');
  SiteSpeedInTimeChart.yAxis().labels().width('35px').fontSize(10);
  SiteSpeedInTimeChart.yAxis().labels().hAlign('right');
  SiteSpeedInTimeChart.yAxis().drawLastLabel(false);
  SiteSpeedInTimeChart.yAxis().drawFirstLabel(false);
  SiteSpeedInTimeChart.yAxis().labels().textFormatter(function(){
    return (this.value/1000).toFixed(1) + 's'
  });

  var i = Math.floor(value/0.5);
  var currentMarker = SiteSpeedInTimeChart.lineMarker();
  currentMarker.value(value  * 1000);
  currentMarker.stroke('2 ' + activeColor);

  SiteSpeedInTimeChart.textMarker(5)
    .scale(SiteSpeedInTimeChart.yScale())
    .value(value  * 1000)
    .text('avg. ' + value + 's<br/><strong>Not Fast</strong>')
    .useHtml(true)
    .align('right')
    .fontColor(activeColor)
    .anchor('leftCenter')
    .offsetX(5);

  var dateScale = anychart.scales.dateTime();
  SiteSpeedInTimeChart.xAxis(1).labels(null);
  SiteSpeedInTimeChart.xScale(dateScale);
  SiteSpeedInTimeChart.xScale().ticks().interval('n', interval*2);
  SiteSpeedInTimeChart.xAxis().labels().textFormatter(function(value) {
    var date = new Date(value['tickValue']);
    var res = date.getHours() + ':' + date.getMinutes();
    return res.replace(':0', ':00');
  });

  SiteSpeedInTimeChart.listen('pointMouseOver', function(evt) {
    showSecondTooltip = true;
    var index = evt.pointIndex;
    var series = evt.target;
    var seriesData = series.data();
    var avgSpeed = seriesData.get(index, 'speed');
    var speedTitle;
    if (avgSpeed >= 2) speedTitle = 'Very Slow';
    if (1.5 < avgSpeed && avgSpeed < 2) speedTitle = 'Slow';
    if (1 < avgSpeed && avgSpeed <= 1.5) speedTitle = 'Not Fast';
    if (0.5 < avgSpeed && avgSpeed <= 1) speedTitle = 'Fast';
    if (avgSpeed <= 0.5) speedTitle = 'Very Fast';
    var date = new Date(seriesData.get(index, 'x'));
    var res = date.getHours() + ':' + date.getMinutes();
    $('#tooltip_chart_2 .title .time').html(res.replace(':0', ':00'));
    $('#tooltip_chart_2 .title .resolution').html(speedTitle);
    $('#tooltip_chart_2 .title .speed span').html(avgSpeed);
    $('#dns_time').html(parseFloat(seriesData.get(index, 'dns_ms')).toFixed(1) + 'ms.');
    $('#connect_time').html(parseFloat(seriesData.get(index, 'connect_ms')).toFixed(1) + 'ms.');
    $('#response_time').html(parseFloat(seriesData.get(index, 'response_ms')).toFixed(1) + 'ms.');
    $('#html_loading_time').html(parseFloat(seriesData.get(index, 'html_loading_ms')).toFixed(1) + 'ms.');
    $('#html_processing_time').html(parseFloat(seriesData.get(index, 'html_processing_ms')).toFixed(1) + 'ms.');
    $('#html_rendering_time').html(parseFloat(seriesData.get(index, 'html_rendering_ms')).toFixed(1) + 'ms.');
    $('#tooltip_chart_2').show();
  });

  SiteSpeedInTimeChart.listen('pointMouseOut', function() {
    showSecondTooltip = false;
    $('#tooltip_chart_2').hide();
  });

  SiteSpeedInTimeChart.listen('mouseMove', function(evt) {
    showSecondTooltip = true;
    var index = evt.pointIndex;
    var series = evt.target;
    var seriesData = series.data();
    var avgSpeed = seriesData.get(index, 'speed');
    var speedTitle;
    if (avgSpeed >= 2) speedTitle = 'Very Slow';
    if (1.5 < avgSpeed && avgSpeed < 2) speedTitle = 'Slow';
    if (1 < avgSpeed && avgSpeed <= 1.5) speedTitle = 'Not Fast';
    if (0.5 < avgSpeed && avgSpeed <= 1) speedTitle = 'Fast';
    if (avgSpeed <= 0.5) speedTitle = 'Very Fast';
    var date = new Date(seriesData.get(index, 'x'));
    var res = date.getHours() + ':' + date.getMinutes();
    $('#tooltip_chart_2 .title .time').html(res.replace(':0', ':00'));
    $('#tooltip_chart_2 .title .resolution').html(speedTitle);
    $('#tooltip_chart_2 .title .speed span').html(avgSpeed);
    $('#dns_time').html(parseFloat(seriesData.get(index, 'dns_ms')).toFixed(1) + 'ms.');
    $('#connect_time').html(parseFloat(seriesData.get(index, 'connect_ms')).toFixed(1) + 'ms.');
    $('#response_time').html(parseFloat(seriesData.get(index, 'response_ms')).toFixed(1) + 'ms.');
    $('#html_loading_time').html(parseFloat(seriesData.get(index, 'html_loading_ms')).toFixed(1) + 'ms.');
    $('#html_processing_time').html(parseFloat(seriesData.get(index, 'html_processing_ms')).toFixed(1) + 'ms.');
    $('#html_rendering_time').html(parseFloat(seriesData.get(index, 'html_rendering_ms')).toFixed(1) + 'ms.');
    $('#tooltip_chart_2').show();
    if (showSecondTooltip)
      $('#tooltip_chart_2').css('top', evt.clientY - 10 - ($('#tooltip_chart_2').height() / 2) ).css('left', evt.clientX + 10)
  });

  SiteSpeedInTimeChart.xAxis().labels().padding([5,0,0,0]);
  SiteSpeedInTimeChart.legend()
    .enabled(true)
    .fontSize(11)
    .position('bottom')
    .align('center')
    .padding([0,0,0,0])
    .hAlign('left')
    .inverted(true)
    .title()
      .enabled(true)
      .align('center')
      .margin([10,0,5,0])
      .hAlign('center')
      .text('Site Speed by Steps');
  return SiteSpeedInTimeChart
}


/**
 * Draw all charts in dashboard without any data (updateChartsData - set data for charts)
 */
function drawCharts() {
  var stage = anychart.graphics.create('container-dashboard');
  var table = anychart.ui.table(3,1);
  table.cellBorder(null);
  table.getRow(0).height(130);
  table.getRow(1).height('35%');
  table.getCell(0, 0).content(createBarLegendChart(1.4));
  table.getCell(1, 0).content(drawVisitsInTime());
  table.getCell(2, 0).content(drawSiteSpeedInTime(1.4));
  drawTooltipChart();
  table.container(stage).draw();
}

function getPagesData(sum_pagesData) {
  var pages_names = [];
  var pages_data = [];
  for (var j = 0; j < sum_pagesData.length; j++) {
    var index = pages_names.indexOf(sum_pagesData[j].name);
    if (index >= 0) {
      pages_data[index][1] += sum_pagesData[j]['visits'];
      pages_data[index][2] += sum_pagesData[j]['speed'];
    } else {
      pages_names.push(sum_pagesData[j].name);
      pages_data.push([sum_pagesData[j].name, sum_pagesData[j]['visits'], sum_pagesData[j]['speed']]);
    }
  }
  return pages_data
}

/**
 * Set data for all charts in dashboard
  @param data {string} - data in csv format
 */
function updateAndGroupData(data) {
  var dataset = anychart.data.set(data, {rowsSeparator: '\n', columnsSeparator: ';', ignoreFirstLine: true});
  var q = dataset.mapAs({
    'x': [0],
    'dns_ms': [1],
    'connect_ms': [2],
    'response_ms': [3],
    'html_loading_ms': [4],
    'html_processing_ms': [5],
    'html_rendering_ms': [6],
    'viewers_count': [7],
    'pagesData': [8]
  });

  q = q.sort('x', 'asc');
  var iter = q.getIterator();
  iter.advance();
  var start = alignDateLeft(iter.get('x'), interval);
  VisitsInTimeChart.xScale().minimum(start);
  SiteSpeedInTimeChart.xScale().minimum(start);

  iter.reset();
  var nextDate = alignDateLeft(start, interval) + interval * 60 * 1000;
  var dataGrouped = [];
  var sum_dns_ms, sum_connect_ms, sum_response_ms, sum_html_loading_ms;
  var sum_html_processing_ms, sum_html_rendering_ms, sum_viewers_count;
  var sum_pagesData, i, currentXPoint;

  while (iter.advance()) {
    var readX = +iter.get('x');
    if (!currentXPoint) {
      currentXPoint = readX;
      sum_dns_ms = +iter.get('dns_ms');
      sum_connect_ms = +iter.get('connect_ms');
      sum_response_ms = +iter.get('response_ms');
      sum_html_loading_ms = +iter.get('html_loading_ms');
      sum_html_processing_ms = +iter.get('html_processing_ms');
      sum_html_rendering_ms = +iter.get('html_rendering_ms');
      sum_viewers_count = +iter.get('viewers_count');
      sum_pagesData = JSON.parse(iter.get('pagesData'));
      i = 1;
    } else {
      if (readX < nextDate) {
        sum_dns_ms += +iter.get('dns_ms');
        sum_connect_ms += +iter.get('connect_ms');
        sum_response_ms += +iter.get('response_ms');
        sum_html_loading_ms += +iter.get('html_loading_ms');
        sum_html_processing_ms += +iter.get('html_processing_ms');
        sum_html_rendering_ms += +iter.get('html_rendering_ms');
        sum_viewers_count += +iter.get('viewers_count');
        sum_pagesData.concat(JSON.parse(iter.get('pagesData')));
        i += 1;
      } else {
        dataGrouped.push({
          'x': alignDateLeft(currentXPoint, interval),
          'dns_ms': sum_dns_ms / i,
          'connect_ms': sum_connect_ms / i,
          'response_ms': sum_response_ms / i,
          'html_loading_ms': sum_html_loading_ms / i,
          'html_processing_ms': sum_html_processing_ms / i,
          'html_rendering_ms': sum_html_rendering_ms / i,
          'speed': ((sum_dns_ms / i + sum_connect_ms / i + sum_response_ms / i + sum_html_loading_ms / i + sum_html_processing_ms / i + sum_html_rendering_ms / i) / 1000).toFixed(2),
          'viewers_count': (sum_viewers_count / i).toFixed(1),
          'pagesData': getPagesData(sum_pagesData)
        });
        nextDate += interval * 60 * 1000;
        currentXPoint = null;
      }
    }
  }
  if (currentXPoint) {
    dataGrouped.push({
      'x': alignDateLeft(currentXPoint, interval),
      'dns_ms': sum_dns_ms / i,
      'connect_ms': sum_connect_ms / i,
      'response_ms': sum_response_ms / i,
      'html_loading_ms': sum_html_loading_ms / i,
      'html_processing_ms': sum_html_processing_ms / i,
      'html_rendering_ms': sum_html_rendering_ms / i,
      'speed': ((sum_dns_ms / i + sum_connect_ms / i + sum_response_ms / i + sum_html_loading_ms / i + sum_html_processing_ms / i + sum_html_rendering_ms / i) / 1000).toFixed(2),
      'viewers_count': sum_viewers_count / i,
      'pagesData': getPagesData(sum_pagesData)
    });
  }
  return dataGrouped
}


/**
 * Set data for all charts in dashboard
  @param data {string} - data in csv format
 */
function updateChartsData(data) {
  var dataGrouped = updateAndGroupData(data);
  if (groupedDataSet) {
    groupedDataSet.data(dataGrouped);
  } else {
    groupedDataSet = anychart.data.set(dataGrouped);

    var visitsInTimeGroupedData = groupedDataSet.mapAs(null, {'value': ['viewers_count'], 'speed': ['speed']});
    VisitsInTimeChart.getSeries(0).data(visitsInTimeGroupedData);

    var SiteSpeedInTimeDataDns = groupedDataSet.mapAs(null, {'value': ['dns_ms']});
    SiteSpeedInTimeChart.getSeries(0).data(SiteSpeedInTimeDataDns);

    var SiteSpeedInTimeDataConnect = groupedDataSet.mapAs(null, {'value': ['connect_ms']});
    SiteSpeedInTimeChart.getSeries(1).data(SiteSpeedInTimeDataConnect);

    var SiteSpeedInTimeDataResponse = groupedDataSet.mapAs(null, {'value': ['response_ms']});
    SiteSpeedInTimeChart.getSeries(2).data(SiteSpeedInTimeDataResponse);

    var SiteSpeedInTimeDataHtmlLoading = groupedDataSet.mapAs(null, {'value': ['html_loading_ms']});
    SiteSpeedInTimeChart.getSeries(3).data(SiteSpeedInTimeDataHtmlLoading);

    var SiteSpeedInTimeDataHtmlProcessing = groupedDataSet.mapAs(null, {'value': ['html_processing_ms']});
    SiteSpeedInTimeChart.getSeries(4).data(SiteSpeedInTimeDataHtmlProcessing);

    var SiteSpeedInTimeDataHtmlRendering = groupedDataSet.mapAs(null, {'value': ['html_rendering_ms']});
    SiteSpeedInTimeChart.getSeries(5).data(SiteSpeedInTimeDataHtmlRendering);
  }

  VisitsInTimeChart.xScale().maximum(alignDateLeft((new Date()).getTime(), interval));
  SiteSpeedInTimeChart.xScale().maximum(alignDateLeft((new Date()).getTime(), interval));
}


function alignDateLeft(date, interval) {
  var dateObj = new Date(+date);
  var years = dateObj.getUTCFullYear();
  var months = dateObj.getUTCMonth();
  var days = dateObj.getUTCDate();
  var hours = dateObj.getUTCHours();
  var minutes = dateObj.getUTCMinutes();
  minutes = alignLeft(minutes, interval);
  return Date.UTC(years, months, days, hours, minutes);
}

function alignLeft(value, interval) {
  var mod = value % interval;
  if (mod < 0)
    mod += interval;
  if (mod >= interval)
    mod -= interval;
  return value - mod;
}
