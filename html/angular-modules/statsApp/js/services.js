'use strict';

angular.module ( 'statsApp.services', [])


  .factory( 'GlobalData', function () {
    return {};
  })

  .factory( 'ScreenVars', function () {
    return {}
  })

  .service ( 'DataService', [ '$http', function ( $http ) {
    return {
      //mock method for returning one of 4 discreet json files
      GetPageData: function ( page ) {
        page = ( page <= 4) ? page : 4;
        var url = 'data/click-share-p' + String( page ) + '.json';
        console.log ( 'getting: ' + url );
        //change url to test data error
        return $http.get ( url );
      }
    }
  }])

  .factory( 'MediaWatcher', [ '$window', 'ScreenVars','$timeout','$rootScope',  function ( $window, ScreenVars, $timeout, $rootScope ) {
    return {
      init: function () {

        //these obviously match rules in external CSS, and are most effective when they do: Not perfectly DRY, but still nifty
        var Watch1024 = $window.matchMedia ( '(min-width: 1024px)' );
        var Watch768 = $window.matchMedia ('(min-width: 768px) and (max-width: 1023px)' );
        var Watch480 = $window.matchMedia ('(min-width: 480px) and (max-width: 767px)');
        var Watch320 = $window.matchMedia ('(min-width: 320px) and (max-width: 479px)');

        //this handler will get called by any of the Watchers above, so we have to check which one
        var handleMediaChange = function ( mediaQueryList ) {
          if ( mediaQueryList.matches ) {
            //set ScreenSize to numbers for use of comparison operators
            if ( mediaQueryList.media.indexOf ( '1024px' ) > -1 ) {
              ScreenVars.screenSize = 1024;
            } else if ( mediaQueryList.media.indexOf ( '768px' ) > -1 ) {
              ScreenVars.screenSize = 768;
            } else if ( mediaQueryList.media.indexOf ( '480px' ) > -1 ) {
              ScreenVars.screenSize = 480;
            } else if ( mediaQueryList.media.indexOf ( '320px' ) > -1 ) {
              ScreenVars.screenSize = 320;
            } 
            if ( ScreenVars.svgElement ) {
              ScreenVars.svgWidth = ScreenVars.svgElement.offsetWidth;
              console.log ( "ScreenVars.svgHeight: " + ScreenVars.svgHeight);
              ScreenVars.svgHeight = ScreenVars.svgElement.offsetHeight;

            }
            $rootScope.$broadcast('screenVarsChanged',  {});

          }
        }

        Watch1024.addListener( handleMediaChange );
        Watch768.addListener( handleMediaChange );
        Watch480.addListener( handleMediaChange );
        Watch320.addListener( handleMediaChange );
        handleMediaChange ( Watch1024 );
        handleMediaChange ( Watch768 );
        handleMediaChange ( Watch480 );
        handleMediaChange ( Watch320 );

      }
    }
  }])

/*
  SHARE RATE
  includes actual shares and actual pageviews: but pageviews are already listed toplevel for each article
  assume this figure only comes from shares from statplace.net
  • show share rate compared to average (2 bars)
  • show pageviews compared to average (2 bars)

  CLICK RATE
  Rate at which people click on full story from Facebook
  Assume each story with this stat has equal exposure
  Could be broken down by Facebook accounts
  • facebook and twitter main bars ( 2 bars )
  • facebook breakdown, twitter breakdown ( 2 bars x 2 )

  PAGEVIEWS
  Views on website
  Could be broken down by referrer

*/

  .service ( 'GraphDataTemplate', [ function () {
    return {
      "share_rate":  {
        "avg_share_rate" : {
          "label": "Average Share Rate",
          "color": '#ff974d',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "avg_share_rate" 
        },
        "share_rate" : {
          "label": "This Article Share Rate",
          "color": false,
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "article.share_rate",
          "bar_height_ratio" : 2,
        },
        "max" : {
          "label": "Max Ever Share Rate",
          "color": '#33cc33',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "max_ever_share_rate" 
        },
      },
      "click_rate" : {
        "avg_click_rate" : {
          "label": "Average  Click Rate",
          "color": '#ff974d',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "avg_click_rate" 
        },
        "max" : {
          "is_percentage" : true,
          "label": "Max Ever Click Rate",
          "color": '#33cc33',
          "value": false,
          "use_scope_var" : "max_ever_click_rate" 
        },
        "click_rate" : {
          "label": "This Article Click Rate",
          "color": '#3b5998',
          "value": false,
          "is_percentage" : true,
          "use_scope_var" : "article.click_rate",
          "bar_height_ratio" : 2,
        },
        "click_rate_children" : {
          "use_children_object" : "article.click_rate_children",
        }

      },
      "pageviews" : {
        "avg_pageviews" : {
          "is_percentage" : false,
          "label": "Average  Pageviews",
          "color": '#ff974d',
          "value": false,
          "use_scope_var" : "avg_pageviews" 
        },
        "pageviews" : {
          "is_percentage" : false,
          "label": "This Article Pageviews",
          "color": false,
          "value": false,
          "use_scope_var" : "article.Pageviews",
          "bar_height_ratio" : 2,
        },
        "max" : {
          "is_percentage" : false,
          "label": "Max Ever Pageviews",
          "color": '#33cc33',
          "value": false,
          "use_scope_var" : "max_ever_pageviews" 
        },
      }
    }
  }])


  .service ( 'GraphSettings', function () {
    return {
      "desktop" : { 
        "height": 20, 
        "graphTopMargin" : 0, 
        "barBottomMargin" : 5, 
        "textY" : "insideBar", //insdieBar, aboveBar
        "textX" : "rightAlign", //rightAlign, leftAlign
        "fontSize" : 12 
      },
      "mobile" : { 
        "height": 20, 
        "graphTopMargin" : 0, 
        "barBottomMargin" : 25, 
        "textY" : "aboveBar", 
        "textX" : "leftAlign", 
        "fontSize" : 11  
      },
      "textFillOutside" : "#333", 
      "textFillInside" : "#fff",
      "assumeTextWidth" : 175,
      "textPadding": 10

    }
  })

  .factory ( 'GraphBuilder', [ 'ScreenVars', 'GraphSettings', '$filter','$timeout',  function ( ScreenVars, GraphSettings, $filter, $timeout ) {
    return {
      buildOneGraph: function ( index, which, article ) {
        //build One Graph is responsible for setting the x and y of bars, x, y and text color of the text for one Graph
        //the bar widths are percentages and they are already set, and don't need to update
        //this function needs to be called by screenSize changes, changes in SVG width

        //make sure these variables are ready (require at least directive.link for svgWidth)
        if ( ( ScreenVars.svgWidth != undefined) && (ScreenVars.screenSize != undefined ) ) {

          if ( 
            ( article.lastSvgWidth == ScreenVars.svgWidth ) &&
              ( article.lastScreenSize == ScreenVars.screenSize ) &&
              ( article.lastCategory == which ) 
          ){
            //do nothing: the graph has been built in the exact current state
            //this can happen on page load, or clicking between articles
            console.log ( 'buildOneGraph called, not needed' );
          } else {
            //only build if we have the vars ready

            var device = ( ScreenVars.screenSize >= 768 ) ? 'desktop' : 'mobile';
            console.log ( 'buildOneGraph (' + device + ' )GO: ' + index + ', ' + which );
            article.lastSvgWidth = ScreenVars.svgWidth;
            article.lastScreenSize = ScreenVars.screenSize;
            article.lastCategory == which;

            var count = 0;
            var previousBarBottom;
            angular.forEach ( article.selectedGraphData, function(v, k){
              //console.log ( 'device: ' + device );
              //v relates to one bar and its associated label
              //****must at least have a .value property, otherwise don't build a BAR for it
              if ( v.value != undefined ) {
                var bar = v; 
                //***SETTINGS FOR THE BAR***
                bar.x = 0;
                //this calculation allows for bars of varying heights
                var yOffsetForLabel = ( GraphSettings [ device ].textY == "aboveBar" ) ? GraphSettings [ device ].fontSize : 0; 
                if ( count == 0 ) {
                  bar.y = GraphSettings [ device ].graphTopMargin + yOffsetForLabel;
                } else {
                  bar.y = previousBarBottom + GraphSettings [ device ].barBottomMargin;
                }
                //setting below will be used by the next iteration above
                var barHeightMagnifyRatio = ( v.bar_height_ratio > 0 ) ? v.bar_height_ratio : 1; 
                bar.height = GraphSettings [ device ].height * barHeightMagnifyRatio;
                previousBarBottom = bar.y + bar.height;
                bar.width = $filter ( 'barWidthFilter' ) ( bar.value, article.selectedGraphData.max.value );
                bar.color = $filter ( 'barColorFilter' ) ( bar.color, index, which );
                //***SETTINGS FOR THE LABEL***
                bar.text = {};
                //filter only needs percentage width, it will use GlobalData.svgWidth to calculate pixelWidth
                bar.text.fontSize = GraphSettings [ device ].fontSize;

                var pixelBarWidth = pixelBarWidth = Math.round ( ScreenVars.svgWidth * bar.width / 100 );
                var textFitsInsideBar = ( pixelBarWidth >  GraphSettings.assumeTextWidth ) ? true : false;
                if ( GraphSettings [ device ].textX == 'leftAlign' ) {
                  bar.text.x = bar.x;
                } else if ( GraphSettings [ device ].textX == 'rightAlign' ) {
                  //bar.width is a raw percentage value
                  bar.text.x = textFitsInsideBar 
                    ? pixelBarWidth - GraphSettings.assumeTextWidth 
                    : pixelBarWidth + GraphSettings.textPadding;
                } 
                if (( GraphSettings [ device ].textY == "aboveBar" ) || ( !textFitsInsideBar )) {
                  bar.text.fill = GraphSettings.textFillOutside;
                } else {
                  bar.text.fill = GraphSettings.textFillInside;
                }
                //&& GraphSettings [ device ].textY == "insideBar"
                if ( GraphSettings [ device ].textY == "insideBar"  ) {
                  bar.text.y = bar.y + ((bar.height - bar.text.fontSize) / 2);
                } else {
                  bar.text.y = bar.y - bar.text.fontSize ;
                }

                //temp
                //              console.log ( 'textY: ' + GlobalData.graphSettings [ device ].textY );
                //              console.log ( 'bar.text: ' + JSON.stringify ( bar.text) );
                count++;
              }//end if v.value
            } );
            //previousBarBottom is now the height of the graph: can use it for vertical centering
            //this function is only called when an svg is expanded: use $timeout to get the offsetHeight
            $timeout ( function () {
              var currentlyExpandedSVG = document.getElementById ( 'svg-' + index );
              ScreenVars.graphTopOffset = ( currentlyExpandedSVG.offsetHeight - previousBarBottom ) / 2;
              // console.log ( 'svg-' + $scope.extrasRevealedIndex + '.height: ' + currentlyExpandedSVG.offsetHeight );
              //console.log ( 'ScreenVars.graphTopOffset: ' + ScreenVars.graphTopOffset );
            });
          }
        }
      }
    }

  }]);

;
