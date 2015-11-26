'use strict';

angular.module ( 'statsApp.controllers', [] )

  .controller ( 'ApplicationController', [ 
    '$scope', '$interval', 'ScreenVars', 'MediaWatcher', 'GraphDataTemplate','GraphSettings', 'DataService', '$filter', 'GlobalData', '$timeout',
    function ( 
      $scope, $interval, ScreenVars, MediaWatcher, GraphDataTemplate, GraphSettings, DataService, $filter, GlobalData, $timeout ) {


      //the following could be set by incoming JSON
      GlobalData.percDecimalPlaces = 0;
      GlobalData.rgbNuetralGray = 25;

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
                  //only one of these can be set on any one object
                  if ( v2.use_scope_var || v2.use_children_object ) {
                    //property_name can only be 'use_scope_var' or 'use_children_object'
                    var property_name = ( v2.use_scope_var ) ? 'use_scope_var':
                      (( v2.use_children_object ) ? 'use_children_object': false);
                    //console.log ( 'property_name: ' + property_name );
                    var valToInsert;
                    if ( v2.use_scope_var ) {
                      //assume it's a global variable previously placed on the scope
                      valToInsert = $scope [ v2.use_scope_var ];
                    }
                    //or if the value has "article." in the string, use the individual article scope level                     
                    //v2 [ property_name ] is the property VALUE
                    //eg property_name "use_scope_var", and v2 [ property_name ] = "article.click_rate"
                    if ( v2 [ property_name ].indexOf ( 'article.') > -1 ) {
                      var use_variable_name = v2[ property_name ].split ( 'article.' ) [1];
                      valToInsert = $scope.articles [ k ] [ use_variable_name ];
                      //*****ONLY INSERT use_children_object if it exists in the incoming data!!!*****
                      if ( valToInsert && v2.use_children_object ) {
                        //make a copy of the object, then REMOVE the click_rate_children object from the template
                        //otherwise the grapher will try and build a bar for the click_rate_children object
                        var copied_use_children_ojbect = angular.copy ( valToInsert );
                        //loop over each child and add it to v1: the current grouping of bar graphs
                        angular.forEach ( valToInsert, function (v3, k3) {
                        //console.log ( 'child to add: ' + JSON.stringify ( v3 ) );
                          //append v3, the current child object, to v1: the current group of bars
                          v1 [ k3 ] = v3; 
                        } );
                        //v2 = false;
                      }

                    }
                    //now set the value on one Graph BAR object
                    if ( v2.use_scope_var ) {
                      v2.value = valToInsert;
                    }
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
            $scope.showMoreArticle(0, 'click_rate');
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
              //****must at least have a .value property, otherwise don't build a BAR for it
              if ( v.value != undefined ) {
                var bar = v; 
                //***SETTINGS FOR THE BAR***
                bar.x = 0;
                //this calculation allows for bars of varying heights
                var yOffsetForLabel = ( GraphSettings [ device ].textY == "aboveBar" ) ? GraphSettings [ device ].fontSizes : 0; 
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
