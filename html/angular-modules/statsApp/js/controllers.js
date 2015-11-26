'use strict';

angular.module ( 'statsApp.controllers', [] )

  .controller ( 'ApplicationController', [ 
    '$scope', '$interval', 'ScreenVars', 'MediaWatcher', 'GraphDataTemplate', 'DataService', '$filter', 'GlobalData', '$timeout',
    function ( 
      $scope, $interval, ScreenVars, MediaWatcher, GraphDataTemplate, DataService, $filter, GlobalData, $timeout ) {


      //the following could be set by incoming JSON
      GlobalData.percDecimalPlaces = 0;
      GlobalData.rgbNuetralGray = 25;
      //textY: above: label goes above var, textY:inside: label goes inside bar or next to it
      //textX: rightAlign: label goes at the right edge of the bar, textX:leftAlign: left edge of bar
      GlobalData.graphSettings = {
        "desktop" : { "height": 20, "graphTopMargin" : 0, "barBottomMargin" : 5, 
                      "textY" : "insideBar", "textX" : "rightAlign", "fontSize" : 12 },
        "mobile" : { "height": 20, "graphTopMargin" : 0, "barBottomMargin" : 25, 
                     "textY" : "aboveBar", "textX" : "leftAlign", "fontSize" : 11  },
        "textFillOutside" : "#333", 
        "textFillInside" : "#fff",
        "assumeTextWidth" : 175,
        "textPadding": 10
      }

      $scope.$on( 'screenVarsChanged', function(event, data) {
        buildGraphsFromScreenDataChange ( data );
        //console.log ( 'SCOPE.on data: ' + JSON.stringify ( data )  );
      });


      var data;
      $scope.currentPage = 1;

      $scope.getPage = function ( page ) {
        //only get page is page is a number
        $scope.articles = [];

        //check page is whole number
        page = ( page % 1 ) == 0 ? page : $scope.currentPage; 
        $scope.currentPage = page;
        $scope.dataError = false;
        DataService.GetPageData  ( page )
          .then ( function ( response ) {
            //manually clean the global numbers: we know every prop is a number
            data = response.data;
            response = null;
            angular.forEach ( data.global_data, function ( v, k ) {
              //set on data and scope (GraphDataProvider needs it on data
              $scope [ k ] = $filter( 'numberCleaner' ) ( v );
            });
            //manually clean the props we want as numbers
            angular.forEach( data.articles, function( v, k) {
              v.share_rate = $filter( 'numberCleaner' )( v.share_rate );
              v.click_rate = $filter( 'numberCleaner' )( v.click_rate );
              v.Pageviews = $filter( 'numberCleaner' )( v.Pageviews );
              //set the relative stats of this article vs global averages
              v.perc_diff_share_rate = $filter ( 'getPercDiff' ) ( v.share_rate, $scope.avg_share_rate );
              v.perc_diff_click_rate = $filter ( 'getPercDiff' ) ( v.click_rate, $scope.avg_click_rate );
              v.perc_diff_pageviews = $filter ( 'getPercDiff' ) ( v.Pageviews, $scope.avg_pageviews );
            });
            $scope.articles = data.articles; 

            //**SET THE GRAPH DATA**/
            angular.forEach ( $scope.articles, function ( v, k ) {
              //v is 1 article : each article needs a copy of GraphDataTemplate
              v.graphData = angular.copy ( GraphDataTemplate );
              angular.forEach ( v.graphData, function ( v1, k1 ) {
                //v1 is each grouping of bar graphs, groups include: share_rate, click_rate, pageviews
                angular.forEach ( v1, function ( v2, k2 ) {
                  //v2: JS object referring to ONE BAR AND ITS LABEL: 
                  //if the use_scope_var property has a vlue, get its value and insert it
                  if ( v2.use_scope_var ) {
                    //assume it's a global variable just placed on the scope
                    var valToInsert = $scope [ v2.use_scope_var ];
                    //use the individual article scope level                     
                    if ( v2.use_scope_var.indexOf ( 'article.') > -1 ) {
                      var use_scope_var = v2.use_scope_var.split ( 'article.' ) [1];
                      valToInsert = $scope.articles [ k ] [ use_scope_var ];
                    }
                    //console.log ( 'valToInsert; ' + valToInsert );
                    //now set the value on one Graph BAR object
                    v2.value = valToInsert;
                  }
                  //if ( k == 0 ) { console.log ( 'v2; ' + JSON.stringify ( v2 ) ); }
                });
              });
            });

            buildPages();
            response = null; 
            //set screenSize and mediaWatch vars
            MediaWatcher.init();
            //TEMP!!//
            $scope.showMoreArticle(0, 'share_rate');
            //END TEMP!!//

          }, function (response) {
            $scope.dataError = true;
          });
      }


      //    $timeout( function () { 
      $scope.getPage();
      //    }, 1000 );

      //this function is custom made to pair used with the JSON structure used in the GraphDataTemplate service
      $scope.buildGraphData = function ( index ) {
        //each article scope can have its own copy of the GraphDataTemplate: each is only created on a user-requests basis
        var hasCoreDataAlready = ( $scope.articles [ index ].graphData ) ? true : false;
        /**SET MAIN STAT VALUES IF NOT SET**/
        if ( !hasCoreDataAlready ) {
          $scope.articles [ index ].graphData = angular.copy ( GraphDataTemplate );

          angular.forEach ( $scope.articles [ index ].graphData, function ( v, k ) {
            //v now refers to each grouping of bar graphs, groups include: share_rate, click_rate, pageviews
            angular.forEach ( v, function ( v2, k2 ) {
              //v2 now refers to each object in a group: each OBJECT REFERS TO ONE BAR AND ITS LABEL
              //if there is a use_scope_var string, get its value and insert it
              if ( v2.use_scope_var ) {
                var curValue = $scope [ v2.use_scope_var ];
                //use the individual article scope level                     
                if ( v2.use_scope_var.indexOf ( 'article.') > -1 ) {
                  var use_scope_var = v2.use_scope_var.split ( 'article.' ) [1];
                  curValue = $scope.articles [ index ][ use_scope_var ];
                }
                //now set the value
                v2.value = curValue;
              }
            });
          });
        }
      }

      $scope.showMoreArticle = function ( index, which ) {
        //console.log ( 'showmore: ' + index + ', ' + which );
        angular.forEach ( $scope.articles, function ( v, k ) {
          v.extrasRevealed = false;
        });
        if ( index == 'close' ) {
          $scope.extrasRevealedIndex = false;st
          $scope.extrasRevealedCategory = false;
        } else {
          $scope.extrasRevealedIndex = index;
          console.log ( 'set extrasRevealedIndex: ' + $scope.extrasRevealedIndex );
          $scope.extrasRevealedCategory = which;
          $scope.articles [ index ].extrasRevealed = true; 
          $scope.buildGraphData ( index );
          //point the graph ng-repeater to the selected data set within the article (eg share_rate)
          //the dom nodes won't be built until this happens
          $scope.articles [ index ].selectedGraphData = $scope.articles [ index ].graphData [ which ];
          buildOneGraph ();
        }
      }

      function buildOneGraph () {
        //build One Graph is responsible for setting the x and y of bars, x, y and text color of the text for one Graph
        //the bar widths are percentages and they are already set, and don't need to update
        //this function needs to be called by screenSize changes, changes in SVG width

        //make sure these variables are ready (require at least directive.link for svgWidth)
        if ( ( ScreenVars.svgWidth != undefined) && (ScreenVars.screenSize != undefined ) ) {

          var index = $scope.extrasRevealedIndex;
          var which = $scope.extrasRevealedCategory;
          var article = $scope.articles [ index ];
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
              var bar = v; 
              //***SETTINGS FOR THE BAR***
              bar.x = 0;
              //this calculation allows for bars of varying heights
              if ( count == 0 ) {
                bar.y = GlobalData.graphSettings [ device ].graphTopMargin;
              } else {
                bar.y = previousBarBottom + GlobalData.graphSettings [ device ].barBottomMargin;
              }
              //setting below will be used by the next iteration above
              var barHeightMagnifyRatio = ( v.bar_height_ratio > 1 ) ? v.bar_height_ratio : 1; 
              bar.height = GlobalData.graphSettings [ device ].height * barHeightMagnifyRatio;
              previousBarBottom = bar.y + bar.height;
              bar.width = $filter ( 'barWidthFilter' ) ( bar.value, article.selectedGraphData.max.value );
              bar.color = $filter ( 'barColorFilter' ) ( bar.color, index, which );
              //***SETTINGS FOR THE LABEL***
              bar.text = {};
              //filter only needs percentage width, it will use GlobalData.svgWidth to calculate pixelWidth
              bar.text.fontSize = GlobalData.graphSettings [ device ].fontSize;

              var pixelBarWidth = pixelBarWidth = Math.round ( ScreenVars.svgWidth * bar.width / 100 );
              var textFitsInsideBar = ( pixelBarWidth >  GlobalData.graphSettings.assumeTextWidth ) ? true : false;
              if ( GlobalData.graphSettings [ device ].textX == 'leftAlign' ) {
                bar.text.x = bar.x;
              } else if ( GlobalData.graphSettings [ device ].textX == 'rightAlign' ) {
                //bar.width is a raw percentage value
                console.log ( 'rightAlign, textFitsInsideBar: ' + textFitsInsideBar );
                bar.text.x = textFitsInsideBar 
                  ? pixelBarWidth - GlobalData.graphSettings.assumeTextWidth 
                  : pixelBarWidth + GlobalData.graphSettings.textPadding;
              } 
              if (( GlobalData.graphSettings [ device ].textY == "aboveBar" ) || ( !textFitsInsideBar )) {
                bar.text.fill = GlobalData.graphSettings.textFillOutside;
              } else {
                bar.text.fill = GlobalData.graphSettings.textFillInside;
              }
              //&& GlobalData.graphSettings [ device ].textY == "insideBar"
              if ( GlobalData.graphSettings [ device ].textY == "insideBar"  ) {
                bar.text.y = bar.y + ((bar.height - bar.text.fontSize) / 2);
              } else {
                bar.text.y = bar.y - bar.text.fontSize ;
              }

              //temp
//              console.log ( 'textY: ' + GlobalData.graphSettings [ device ].textY );
//              console.log ( 'bar.text: ' + JSON.stringify ( bar.text) );
              count++;
            } );
            //previousBarBottom is now the height of the graph: can use it for vertical centering
            //this function is only called when an svg is expanded: use $timeout to get the offsetHeight
            $timeout ( function () {
              var currentlyExpandedSVG = document.getElementById ( 'svg-' + $scope.extrasRevealedIndex );
              $scope.graphTopOffset = ( currentlyExpandedSVG.offsetHeight - previousBarBottom ) / 2;
              //console.log ( 'svg-' + $scope.extrasRevealedIndex + '.height: ' + currentlyExpandedSVG.offsetHeight );
              //console.log ( '$scope.graphTopOffset: ' + $scope.graphTopOffset );
            });
          }
        }
      }

      function buildGraphsFromScreenDataChange ( data ) {
        //remember index can be 0, and if it's false we don't need it
        //also check we have both screenSize and svgWidth
        if ( $scope.extrasRevealedIndex > -1 ) {
          $scope.articles [ $scope.extrasRevealedIndex ].svgWidth = ScreenVars.svgWidth;
          $scope.articles [ $scope.extrasRevealedIndex ].screenSize = ScreenVars.screenSize;
          buildOneGraph ();
          //broadCast emit, the source of this call, strangely happens outside of $digest, so call $apply
          $timeout ( function () {
            $scope.$apply();
          }, 0);
        }
      }

      function buildPages() {
        //console.log ( '$scope.global.total_pages: ' + $scope.global.total_pages );
        $scope.pages = [];
        var dotCount = 0;
        for ( var i=0; i< $scope.total_pages; i++ ) {
          $scope.pages[ i ] = {};
          $scope.pages[ i ].tiny = false;
          if ( $scope.total_pages < 10 ) {
            $scope.pages[ i ].value = i + 1;
            $scope.pages[ i ].display = true;
          } else {
            if  ( 
              ( i == 0 ) 
                || ( (i + 1) == ( $scope.total_pages ) ) 
                || ( (i + 1) == ( $scope.current_page ) ) 
                || ( (i + 1) == ( $scope.current_page - 1 ) ) 
                || ( (i + 1)  == ( $scope.current_page + 1 ) ) 
            ) {
              $scope.pages[ i ].value = i + 1;
              $scope.pages[ i ].display = true;
              dotCount=0;
            } else {
              dotCount = ( dotCount <= 3 ) ? dotCount + 1 : dotCount;
              $scope.pages[ i ].value = ( dotCount == 4 ) ? '' : '.';
              $scope.pages[ i ].display = ( dotCount == 4 ) ? false : true;

            }
          }
        }
      }
    }]) // end Application Controller

;
