/**
 * @param {array} rows
 * @param {integer} index
 */
function unpack(rows, index) {
  return rows.map(function(row) {
    return row[index];
  });
}

function rollingCorrelation(arr1, arr2, windowPeriod = 10) {
  var corrs = [];
  for (var i = 0; i < arr1.length - windowPeriod; i++) {
    var win1 = [];
    var win2 = [];
    for (var j = 0; j < windowPeriod; j++) {
      win1.push(arr1[i + j]);
      win2.push(arr2[i + j]);
    }
    corrs.push(ss.sampleCorrelation(win1, win2));
  }
  return corrs;
}

function handleSubmit() {
  Plotly.d3.event.preventDefault();

  var stock1 = Plotly.d3.select("#stockInput1").node().value;
  var stock2 = Plotly.d3.select("#stockInput2").node().value;

  Plotly.d3.select("#stockInput1").node().value = "";
  Plotly.d3.select("#stockInput2").node().value = "";

  buildPlot(stock1, stock2);
}

function buildPlot(stock1, stock2) {
  var apiKey = "BWzUsp_J8Eky_itpwm8d";
  var url1 = `https://www.quandl.com/api/v3/datasets/WIKI/${stock1}.json?start_date=2010-10-01&end_date=2019-10-01&api_key=${apiKey}`;
  var url2 = `https://www.quandl.com/api/v3/datasets/WIKI/${stock2}.json?start_date=2010-10-01&end_date=2019-10-01&api_key=${apiKey}`;

  Plotly.d3.json(url1, function(err1, response1) {

    if (err1) return console.warn(err1);

    Plotly.d3.json(url2, function(err2, response2) {
      if (err2) return console.warn(err2);

      var name1 = response1.dataset.name;
      var name2 = response2.dataset.name;
      var stock1 = response1.dataset.dataset_code;
      var stock2 = response2.dataset.dataset_code;
      var dates = unpack(response1.dataset.data, 0);
      var closingPrices1 = unpack(response1.dataset.data, 1);
      var closingPrices2 = unpack(response2.dataset.data, 1);

      var period = 10;
      var corrs = rollingCorrelation(closingPrices1, closingPrices2, period);
      var trace1 = {
        type: "scatter",
        mode: "lines",
        name: `${name1} vs ${name2}`,
        x: dates.slice(period),
        y: corrs,
        line: {
          color: "#17BECF"
        }
      };

      var data = [trace1];

      var layout = {
        title: `${stock1} ${stock2} Correlation Plot`,
        xaxis: {
          type: "date"
        },
        yaxis: {
          autorange: true,
          type: "linear"
        }
      };

      Plotly.newPlot("plot", data, layout);

    });

  });
}

Plotly.d3.select("#submit").on("click", handleSubmit);
