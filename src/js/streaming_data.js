var data;

/**
 * Generate
 * Pushes new fake random data row as last data and remove first row from data.
 * Also updates logger and calls function to update data for all charts in dashboard
 */
function streamData() {
  var data_generated = generateData(null);
  data.unshift(data_generated);
  data.pop();
  updateChartsData(data.join('\n'));
  $('#logger').html(data.join('\n'));
}

/**
 * Onready jquery function
 * Creates dataset to start charting with, calls drawing charts ang setting data for all charts in dashboard
 */
$(function () {
  data = generateStartData();
  $('#logger').text(data.join('\n'));
  setInterval(streamData, 30000);
  drawCharts();
  updateChartsData(data.join('\n'));
});


