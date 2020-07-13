const heighta = "76vh"
const height = "68vh"
const width = "80vw"
const wpadding = "8vw"
const hpadding = "8vh"
const pxwidth = (window.innerWidth)
const pxheight = (window.innerHeight)

function conv(x) {
    x = x.split("v")
    if (x[1] == "w") {
        return (parseInt(x[0]) * pxwidth) / 100
    }
    else if (x[1] == "h") {
        return (parseInt(x[0]) * pxheight) / 100
    }
}

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", heighta)

var tooltip = d3.select(".holder").append("span")
    .attr("id", "tooltip")
    .style("opacity", 0);

function sub(x, y) {
    // a vw - b vw
    x = x.split("v")
    a = x[0]
    y = y.split("v")
    b = y[0]
    return (a - b).toString() + "v" + x[1]
}

function clean(x) {
    for (let i = 0; i < x.length; i++) {
        var b = x[i][0]
        var a = x[i][0].split("-")
        if (a[1] === "01") {
            x[i].splice(0, 1, a[0], "Q1")
            x[i].push(parseInt(a[0]))
        }
        else if (a[1] === "04") {
            x[i].splice(0, 1, a[0], "Q2")
            x[i].push(parseInt(a[0])+0.25)
        }
        else if (a[1] === "07") {
            x[i].splice(0, 1, a[0], "Q3")
            x[i].push(parseInt(a[0])+0.5)
        }
        else if (a[1] === "10") {
            x[i].splice(0, 1, a[0], "Q4")
            x[i].push(parseInt(a[0])+0.75)
        }
        x[i].push(b)
        console.log(x)
    }
    return x
}

fetch(url)
    .then(response => response.json())
    .then(data => {
        const dataset = clean(data.data)
        const xScale = d3.scaleLinear().domain([0, dataset.length - 1]).range([wpadding, sub(width, wpadding)])
        const yScale = d3.scaleLinear().domain([0, d3.max(dataset, d => d[2])]).range([height, hpadding])
        
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("data-date", d => d[4])
            .attr("data-gdp", d => d[2])
            .attr("width", "0.23vw")
            .attr("height", d => sub(height, yScale(d[2])))
            .attr("x", (d, i) => xScale(i))
            .attr("y", d => yScale(d[2]))
            .attr("fill", "rgb(51, 173, 255)")
            .on('mouseover', function (d, i) {
                tooltip.transition()
                    .duration(0)
                    .style("opacity", 0.8)
                    .style("top", "60vh")
                    .style("left", function () {
                        if (i < 235) {
                            return sub(xScale(i), "-15vw")
                        }
                        return sub(xScale(i), "15vw")
                    })
                    .attr("data-date", d[4])
                d3.select("#tooltip").html(`${d[0]} ${d[1]}<br> $ ${d[2]} Billion`)
            })
            .on('mouseout', function () {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0)
            })

        const xcale = d3.scaleLinear().domain([d3.min(dataset, d => d[3]), d3.max(dataset, d => d[3])])
            .range([conv(wpadding), conv(sub(width, wpadding))])
        const xAxis = d3.axisBottom().scale(xcale)

        const ycale = d3.scaleLinear().domain([d3.max(dataset, d => d[2]), 0])
            .range([conv(hpadding), conv(height)])
        const yAxis = d3.axisLeft().scale(ycale)

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0," + conv(height) + ")")
            .call(xAxis)

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + conv(wpadding) + ",0)")
            .call(yAxis)
    })