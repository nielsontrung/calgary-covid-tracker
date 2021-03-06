var calendarDom = document.getElementById("calendar")
var calendar = echarts.init(calendarDom, "dark")
var calendarApp = {}

var option

var startYear
var endYear
var calendarWidth = 220
var windowWidth = $(document).width()

function getCalendarData(csv) {
  data = {}
  var rows = csv.split("\n")
  startYear = new Date().getFullYear()
  year = 0
  endYear = new Date().getFullYear()

  for (var i = 1; i < rows.length - 1; i++) {
    row = rows[i].split(",")
    date = row[1]
    region = row[3]
    if (region.includes("CITY OF CALGARY")) {
      active_cases = parseInt(row[5])
      year = parseInt(date.split("-")[0])
      if (!(year in data)) {
        startYear = Math.min(startYear, year)
        data[year] = []
        data[year].push([date, active_cases])
      } else {
        data[year].push([date, active_cases])
      }
    }
  }
  return data
}

function getTooltipFormat(p) {
  return (
    "<b>Calgary</b>" +
    "<br/>" +
    p.data[0] +
    "<br/>" +
    "Active Cases: " +
    p.data[1]
  )
}
function getVisualMapOffset() {
  var calendarOffset =
    (windowWidth - (endYear + 2 - startYear) * calendarWidth) /
    (endYear - startYear)
  return calendarOffset
}

function getCalendarOptions() {
  var calendarOptions = []
  var cellWidth = 13
  var cellHeight = 13
  var calendarOffset =
    (windowWidth - (endYear - startYear) * calendarWidth) /
    (endYear - startYear)
  for (var i = 0; i < endYear - startYear + 1; i++) {
    option = {
      cellSize: [cellWidth, cellHeight],
      orient: "vertical",
      range: (startYear + i).toString(),
      bottom: 40,
    }
    option["left"] = i * calendarWidth + calendarOffset
    calendarOptions.push(option)
  }
  return calendarOptions
}

function getSeriesOptions() {
  var seriesOptions = []
  for (var i = 0; i < endYear - startYear + 1; i++) {
    option = {
      name: "Active Daily Covid-19 Cases",
      type: "heatmap",
      coordinateSystem: "calendar",
      calendarIndex: i,
      data: calendar_data[startYear + i],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    }
    seriesOptions.push(option)
  }

  return seriesOptions
}

var csv
var calendar_data

var calendarURL =
  "https://raw.githubusercontent.com/nielsontrung/calgary-covid-map/main/covid-19-alberta-statistics-map-data.csv"

$.get(calendarURL, (response) => {
  csv = response
  calendar_data = getCalendarData(csv)
  option = {
    title: {
      text:
        "Daily Active Covid-19 cases City of Calgary \n (Mar-01-2022) - " +
        end_date_formatted,
      left: "center",
      top: 15,
      textStyle: {
        fontSize: 25,
      },
    },
    tooltip: {
      position: "right",
      formatter: (p) => getTooltipFormat(p),
    },
    backgroundColor: "#161627",
    visualMap: {
      min: 0,
      max: 5000,
      type: "continuous",
      calculable: true,
      orient: "vertical",
      right: getVisualMapOffset(),
      top: "center",
    },
    calendar: getCalendarOptions(),
    series: getSeriesOptions(),
  }

  if (option && typeof option === "object") {
    calendar.setOption(option)
  }
})
