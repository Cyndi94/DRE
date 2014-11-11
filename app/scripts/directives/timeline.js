'use strict';

/**
 * @ngdoc directive
 * @name phrPrototypeApp.directive:timeline
 * @Takes two inputs, chartData and chartType.
 * # timeline
 */
angular.module('phrPrototypeApp')
    .directive('timeline', function ($window, $location, $anchorScroll) {
        return {
            restrict: 'EA',
            template: "<svg style='width:100%;'></svg>",
            link: function postLink(scope, element, attrs) {

                var navClick = function (element) {
                    var old = $location.hash();
                    $location.hash(element);
                    $anchorScroll();
                    //reset to old to keep any additional routing logic from kicking in
                    $location.hash(old);
                };

                var plotHeight = 60;
                var boundaryOffset = 15;
                var boundaryWidth = 3;
                var boundaryLabelOffset = 30;
                var boundaryLabelPadding = 5;
                var plotBaseColor = "#6AA6FF";

                var plotCircles = [];
                var plotDomain = [];
                var timeScale;
                var timeScaleTicks = [];
                var d3 = $window.d3;
                var rawSvg = element.find("svg")[0];
                var svg = d3.select(rawSvg).attr("height", plotHeight);
                var format = d3.time.format("%m/%d/%Y");

                var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return '<span>' + '100' + '</span>' + ' entries'; });
                svg.call(tip);

                function gatherData() {
                    var dataToPlot = scope[attrs.chartData];
                    var dataType = attrs.chartType;
                    var tmpDomain = [];

                    if (dataType === 'account') {

                        for (var i in dataToPlot.recordHistory) {
                            var plotDate = format.parse(dataToPlot.recordHistory[i].date);
                            plotCircles.push({
                                "date": plotDate
                            });
                            tmpDomain.push(plotDate);
                        }

                        var minDate = d3.min(tmpDomain);
                        var maxDate = d3.max(tmpDomain);
                        var plotFloor = d3.time.month.floor(d3.time.month.offset(minDate, -2));
                        var plotCeiling = d3.time.month.floor(d3.time.month.offset(maxDate, 2));
                        plotDomain = [plotFloor, plotCeiling];
                    }
                }

                function renderPlot() {

                    var width;

                    function getSVGWidth() {
                        width = parseInt(svg.style('width'), 10);
                    }

                    function buildScale() {
                        timeScale = d3.time.scale()
                            .range([(boundaryOffset + (boundaryWidth / 2)), width - (boundaryOffset - (boundaryWidth / 2))])
                            .domain(plotDomain);
                    }

                    function buildTicks () {

                    	timeScaleTicks = [];
                    	 //TODO:  Configure this for monthly ticks.
                        var tmpTimeScaleTicks = timeScale.ticks(20);
                        
                        for (var i in tmpTimeScaleTicks) {
                        	timeScaleTicks.push({
                        		"x_axis": timeScale(tmpTimeScaleTicks[i]),
                        		"y_axis": (plotHeight - boundaryLabelOffset - boundaryLabelPadding) / 2
                        	});
                        }
                    }

                    function structureData() {
                        for (var i in plotCircles) {
                            plotCircles[i].x_axis = timeScale(plotCircles[i].date);
                            plotCircles[i].y_axis = (plotHeight - boundaryLabelOffset - boundaryLabelPadding) / 2;
                            plotCircles[i].radius = 10;
                            plotCircles[i].color = plotBaseColor;
                            plotCircles[i].href = "entry" + i;
                        }
                    }

                    function plotData() {
                        svg.selectAll('*').remove();
                        var boundaryData = [{
                            "x": boundaryOffset,
                            "y": 0,
                            "width": boundaryWidth,
                            "height": plotHeight - boundaryLabelOffset - boundaryLabelPadding,
                            "color": plotBaseColor
                        }, {
                            "x": width - boundaryOffset,
                            "y": 0,
                            "width": boundaryWidth,
                            "height": plotHeight - boundaryLabelOffset - boundaryLabelPadding,
                            "color": plotBaseColor
                        }];

                        var plotLineData = [{
                            "x": boundaryOffset,
                            "y": ((plotHeight - boundaryLabelOffset - boundaryLabelPadding) / 2) - 1,
                            "width": width - boundaryOffset - boundaryOffset,
                            "height": 3,
                            "color": plotBaseColor
                        }];


                        var boundaryDisplayFormat = d3.time.format("%b %Y");

                        var boundaryLabel = [{
                            "x": 0,
                            "y": plotHeight - boundaryLabelPadding,
                            "anchor": "start",
                            "text": boundaryDisplayFormat(plotDomain[0])
                        }, {
                            "x": width,
                            "y": plotHeight - boundaryLabelPadding,
                            "anchor": "end",
                            "text": boundaryDisplayFormat(plotDomain[1])
                        }];

                        var boundaryLabels = svg.selectAll("text").data(boundaryLabel).enter().append("text");
                        var boundaryLabelAttributes = boundaryLabels
                        	.attr("x", function (d) {
                                return d.x;
                            })
                            .attr("y", function (d) {
                                return d.y;
                            })
                            .text(function (d) {
                                return d.text;
                            })
                            .style("text-anchor", function (d) {
                                return d.anchor;
                            });


                        var boundaries = svg.selectAll("plotBoundary").data(boundaryData).enter().append("rect");
                        var boundaryAttributes = boundaries
                            .attr("x", function (d) {
                                return d.x;
                            })
                            .attr("y", function (d) {
                                return d.y;
                            })
                            .attr("width", function (d) {
                                return d.width;
                            })
                            .attr("height", function (d) {
                                return d.height;
                            })
                            .style("fill", function (d) {
                                return d.color;
                            });

                            console.log(plotLineData);

                        var plotLine = svg.selectAll("plotLine").data(plotLineData).enter().append("rect");
                        var plotLineAttributes = plotLine
                            .attr("x", function (d) {
                                return d.x;
                            })
                            .attr("y", function (d) {
                                return d.y;
                            })
                            .attr("width", function (d) {
                                return d.width;
                            })
                            .attr("height", function (d) {
                                return d.height;
                            })
                            .style("fill", function (d) {
                                return d.color;
                            });

                        /*var plotLines = svg.selectAll("plotLines").data(timeScaleTicks).enter().append("circle");
                        var plotLineAttributes = plotLines
                        	.attr("cx", function (d) {
                        		//console.log(d);
                                return d.x_axis;
                            })
                            .attr("cy", function (d) {
                                return d.y_axis;
                            })
                            .attr("r", 2)
                            .style("fill", "#5bc0de")
                            .attr("class", "plotLines");*/



                        var circles = svg.selectAll("plotPoint").data(plotCircles).enter().append("circle");
                        var circleAttributes = circles
                            .attr("cx", function (d) {
                                return d.x_axis;
                            })
                            .attr("cy", function (d) {
                                return d.y_axis;
                            })
                            .attr("r", function (d) {
                                return d.radius;
                            })
                            .attr("class", "plotPoint")
                            .on('mouseover', function (d) {

                                var tipFormat = d3.time.format("%m/%d/%Y");


                                tip.attr('class', 'd3-tip animate').html(function(d) { return '<span>' + tipFormat(d.date) + '</span>'; }).show(d);
                            })
                            .on('mouseout', function (d) {
                                tip.attr('class', 'd3-tip').show(d);
                                tip.hide();
                            })
                            .on("click", function(d) {
                                navClick(d.href);
                            });
                    }

                    getSVGWidth();
                    buildScale();
                    buildTicks();
                    structureData();
                    plotData();

                }

                //gatherData only on first run.
                gatherData();
                renderPlot();

                //Re-evaluate scope on resize.
                $window.onresize = function () {
                    scope.$apply();
                    renderPlot();
                };

            }
        };
    });