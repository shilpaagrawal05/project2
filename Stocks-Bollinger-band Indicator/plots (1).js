/**
 * Helper function to select stock data
 * Returns an array of values
 * @param {array} rows
 * @param {integer} index
 * index 0 - Date
 * index 1 - Open
 * index 2 - High
 * index 3 - Low
 * index 4 - Close
 * index 5 - Volume
 */
function unpack(rows, index) {
  return rows.map(function(row) {
    return row[index];
  });
}

function unpackCSV(data, property) {
  return data.map(function(row) {
    return row[property];
  });
}

// Calculate a rolling average for an array
function rollingAverage(arr, windowPeriod = 10) {
  // rolling averages array to return
  var averages = [];

  // Loop through all of the data
  for (var i = 0; i < arr.length - windowPeriod + 1; i++) {
    // calculate the average for a window of data
    var sum = 0;
    for (var j = 0; j < windowPeriod; j++) {
      sum += arr[i + j];
    }
    // calculate the average and push it to the averages array
    averages.push(sum / windowPeriod);
  }
  return averages;
}

// Submit Button handler
function handleSubmit() {
  // Prevent the page from refreshing
  d3.event.preventDefault();

  
  // Select the input value from the form
  var stock = d3.select("#stockInput").node().value;
  console.log("Stock Selected: " + stock);

  d3.csv("http://localhost:8000/" + stock + ".csv").then(
    function(data) {
      buildBollingerBand(data);
    }
  );
  // Build the plot with the new stock
  //buildPlot(stock);
}
function getBollingerBands(n, k, data) {
  var bands = []; //{ ma: 0, low: 0, high: 0 }
  for (var i = n - 1, len = data.length; i < len; i++) {
      var slice = data.slice(i + 1 - n , i);
      var mean = d3.mean(slice, function(d) { return d.close; });
      var stdDev = Math.sqrt(d3.mean(slice.map(function(d) {
          return Math.pow(d.close - mean, 2);
      })));
      bands.push({ date: data[i].date,
                   ma: mean,
                   low: mean - (k * stdDev),
                   high: mean + (k * stdDev) });
  }
  return bands;
}
function buildBollingerBand(data) {

    /*for (var prop in data) {
      console.log(prop);
    }*/

    var cols = "date,change,changeOverTime,changePercent,close,high,label,low,open,symbol,uClose,uHigh,uLow,uOpen,uVolume,volume";
    // Grab values from the response json object to build the plots
    var len = data.length;
    var stock = data[0].symbol;
    
    var startDate = data[0].date;
    var endDate = data[len - 1].date;

    var dates = unpackCSV(data, "date");
    var openingPrices = unpackCSV(data, "open");
    var highPrices = unpackCSV(data, "high");
    var lowPrices =  unpackCSV(data, "low");
    var closingPrices = unpackCSV(data, "close");
    var movingPeriod = 20;
    var stdDevScale = 2;
    var bandsData = getBollingerBands(movingPeriod, stdDevScale, data);
    var bDates = unpackCSV(bandsData, "date");
    var bMean = unpackCSV(bandsData, "ma");
    var bLow = unpackCSV(bandsData, "low");
    var bHigh = unpackCSV(bandsData, "high");
    
    var trace1 = {
      type: "scatter",
      mode: "lines",
      name: "Lower Bound",
      x: bDates,
      y: bLow,
      line: {
        width : 0
      },
      marker: {color : "444"}
    };

    
    var trace2 = {
      type: "scatter",
      mode: "lines",
      name: "Close Price",
      x: dates,
      y: closingPrices,
      fill: "tonexty",
      fillcolor: "rgba(68, 68, 68, 0.3)", 
      line: {color: "rgb(31, 119, 180)"}, 
    };

    
    var trace3 = {
      type: "scatter",
      mode: "lines",
      name: "Upper Bound",
      x: bDates,
      y: bHigh,
      line:{width:0},
      marker: {color: "444"},
      fill: "tonexty",
      fillcolor: "rgba(68,68,68,0.3)"
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
}

// Add event listener for submit button
d3.select("#submit").on("click", handleSubmit);
