/**
 * @param {array} rows
 * @param {integer} index
 */
function unpack(rows, index) {
  return rows.map(function(row) {
    return row[index];
  });
}

function rollingAverage(arr, windowPeriod = 10) {
  var averages = [];

  for (var i = 0; i < arr.length - windowPeriod + 1; i++) {
    var sum = 0;
    for (var j = 0; j < windowPeriod; j++) {
      sum += arr[i + j];
    }
    averages.push(sum / windowPeriod);
  }
  return averages;
}

function handleSubmit() {
  d3.event.preventDefault();

  var stock = d3.select("#stockInput").node().value;
  console.log(stock);
  d3.select("#stockInput").node().value = "";

  buildPlot(stock);
}

function buildPlot(stock) {
  var apiKey = "BWzUsp_J8Eky_itpwm8d";

  var url = `https://www.quandl.com/api/v3/datasets/WIKI/${stock}.json?start_date=2016-10-01&end_date=2017-10-01&api_key=${apiKey}`;

  d3.json(url).then(function(data) {

    var name = data.dataset.name;
    var stock = data.dataset.dataset_code;
    var startDate = data.dataset.start_date;
    var endDate = data.dataset.end_date;
    var dates = unpack(data.dataset.data, 0);
    var openingPrices = unpack(data.dataset.data, 1);
    var highPrices = unpack(data.dataset.data, 2);
    var lowPrices = unpack(data.dataset.data, 3);
    var closingPrices = unpack(data.dataset.data, 4);
    var rollingPeriod = 30;
    var rollingAvgClosing = rollingAverage(closingPrices, rollingPeriod);

    var trace1 = {
      type: "scatter",
      mode: "lines",
      name: name,
      x: dates,
      y: closingPrices,
      line: {
        color: "#17BECF"
      }
    };

    var trace2 = {
      type: "candlestick",
      x: dates,
      high: highPrices,
      low: lowPrices,
      open: openingPrices,
      close: closingPrices
    };

    var trace3 = {
      type: "scatter",
      mode: "lines",
      name: "Rolling",
      x: dates.slice(0, dates.length - rollingPeriod),
      y: rollingAvgClosing
    };

    var data = [trace1, trace2, trace3];

    var layout = {
      title: `${stock} closing prices`,
      xaxis: {
        range: [startDate, endDate],
        type: "date"
      },
      yaxis: {
        autorange: true,
        type: "linear"
      }
    };

    Plotly.newPlot("plot", data, layout);

  });
}

d3.select("#submit").on("click", handleSubmit);
