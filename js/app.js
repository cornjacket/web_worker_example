"use strict"

console.log("app is up")


///////////////////////////////////////////////////////////////


$(function(){

  var Opponent = {

    init: function() {         
      this.joker_has_center = false;
      this.is_first_turn    = true;
      this.turn = 0
      //console.log("Opponent.init invoked")
    },

    choose_square: function() {
      //console.log("Opponent.choose_square invoked")
      // this can be removed
      /*function canonical_distance(sq1, sq2) {
        return Math.max(Math.abs(sq1.row-sq2.row),
                        Math.abs(sq1.column-sq2.column))
      } */         
      var possible_moves = GameController.open_squares()
      var match;
      var sides;
      // Check all remaining open squares to see if the Joker wins
      //console.log(possible_moves)
      match = possible_moves.filter(function(elem) {
        var board_copy = GameController.clone_board()
        board_copy.mark(elem.row,elem.column,"Joker")
        return board_copy.is_winner("Joker")
      })
      if (match.length != 0) {
        //console.log("Winner Found. Pick first")
        this.is_first_turn = false
        console.log("turn_no = "+this.turn+" is_winner_joker")
        this.turn += 1
        return {
          row:    match[0].row,
          column: match[0].column
        } 
      }
      // Check all remaining open squares to see if the Joker needs to
      // block Batman from the win
      //console.log(possible_moves)
      match = possible_moves.filter(function(elem) {
        var board_copy = GameController.clone_board()
        board_copy.mark(elem.row,elem.column,"Batman")
        return board_copy.is_winner("Batman")
      })
      if (match.length != 0) {
        //console.log("Block Found. Pick first")
        this.is_first_turn = false
        console.log("turn_no = "+this.turn+" is_winner_batman")
        this.turn += 1        
        return {
          row:    match[0].row,
          column: match[0].column
        } 
      }
      //If center is open, grab it
      if (GameController.is_square_open(1,1)) {
        //console.log("Center Square Found.")
        this.joker_has_center = true;
        this.is_first_turn    = false
        console.log("turn_no = "+this.turn+" is_center_open")
        this.turn += 1        
        return {
          row: 1,
          column: 1
        }
      }
      // if center belongs to batman and this is first turn
      // then grab first corner
      var first_corner = {row: 0, column: 0}
      if (this.is_first_turn && GameController.batman_has_center()) {
        this.is_first_turn = false
        console.log("turn_no = "+this.turn+" batman_has_centerr")
        this.turn += 1        
        this.is_first_turn = false
        return first_corner
      }
      this.is_first_turn = false

      console.log("Let's check for potential doubles")
      var board_copies_1_step = []
      possible_moves.forEach(function(move) {
        var board_copy = GameController.clone_board()
        board_copy.mark(move.row,move.column,"Joker")
        board_copies_1_step.push(board_copy)
      }) 
      //console.log("possible moves")
      //console.log(possible_moves)
      //console.log(board_copies_1_step)
      var rejected_move_indices = [] // not sure
      // at this point board_copies_1_step has a list of boards's with Jokers next moves
      // iterate through board_copies_1_step
      board_copies_1_step.forEach(function(board_copy_1_step,index,ary) {
        console.log("Board copy 1 step index "+index+" corresponding to Joker move "
                    +possible_moves[index].row+", "+possible_moves[index].column)
        console.log(board_copy_1_step)
        var open_spaces_1_step = board_copy_1_step.open_squares()
            
        var joker_one_step_win = board_copy_1_step.has_one_move_to_win("Joker")
        if (joker_one_step_win) {
          console.log("Joker has one step win")
          console.log(joker_one_step_win)
          // why aren't I doing something with this info
        }
        // once we find a winner we can break out, we dont need a forEach here
        open_spaces_1_step.forEach(function(open_space,index2,ary2) {
          var num_of_wins = 0
          var move_wins = []
          var board_copy_2_step = board_copy_1_step.clone()
          console.log("Inner loop: marking open space")
          console.log(open_space)
          board_copy_2_step.mark(open_space.row,open_space.column,"Batman")
          var win = board_copy_2_step.has_one_move_to_win("Batman")            
          if (win) {
            num_of_wins = win.length
            move_wins.push(win) // not needed
            if (num_of_wins >= 2) {
              console.log("Double found")
              //console.log("Win")
              //console.log(win)
              //console.log("Open Space ")
              //console.log(open_space)
              rejected_move_indices.push(index) // not sure
              //console.log("Batmans moves")
              //console.log(move_wins)
            }
          }

        })           
      })
      //console.log("possible moves")
      //console.log(possible_moves)
      //console.log("Here are the bad indices")
      //console.log(rejected_move_indices)
      // go through bad indices and remove from possible_moves
      // if index of possible_moves element is not in rejected list, then it is included
      var filtered_moves = possible_moves.filter(function(elem,index,ary) {
        return rejected_move_indices.indexOf(index) === -1
      })
      //console.log(filtered_moves)
      // for now I can pick first if there are multiple entries here
      // maybe later i can look for optimal options, like go on the attack
      // looking for at least one non-rejected item, but if none are rejected then we
      // skip this and grab a side.


////////////////////////////


// DRT SURE THE REASON FOR THE filter.length !== pssible.length ??? Need to look at later


//////////////////////////


      if (filtered_moves.length > 0 && filtered_moves.length !== possible_moves.length) {
        return filtered_moves[0]
      }
      console.log("Opponent: There are no 2step moves for Joker")
      // if we get here, then all filtered_moves were rejected and we need
      // to find a move that puts Batman under attack
      // for now a simple fix will be to just return first valid side
      // as this works during testing
      // maybe i can address this scenario later if this doesnt fix it.
      // but it looks like this hack works
      sides = [ {row: 0, column: 1}, {row: 1, column: 0}, 
                {row: 1, column: 2}, {row: 2, column: 1}]
      // pick a side
      match = sides.filter(function (elem) {
        return GameController.is_square_open(elem.row,elem.column)
      })
      //console.log("there has to be one side open, so pick the first")
      if (match.length > 0) {
        return {
          row: match[0].row,
          column: match[0].column
        }
      }     
      console.log("Opponent: Last Resort move is "+possible_moves[0].row+
                  " , "+possible_moves[0].column)
      return possible_moves[0]

     }
  }

/* Encapsulation in JavaScript
(The Best Object Creation Pattern: Combination Constructor/Prototype Pattern)
http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
*/

//    var Board = {
    function Board(init_ary) {  // = 

      if (!init_ary) {
        this.grid = ["", "", "", "", "", "", "", "", ""] // [0] -> top_left, [8] -> bottom_right
        this.occupied_spaces = 0;
      } else {
        // allow to create a new board from input arg, may need to change argument
        this.grid = init_ary.map(function(e) { return e } )
        this.occupied_spaces = this.grid
          .filter(function(elem) {
            return elem !== ""
          }).length;
      }
      //console.log("Board constructor invoked")
      //console.log(this.grid)
      //console.log("occupied_spaces = "+this.occupied_spaces)
    }

    // setting the prototype using this literal notation requires that we explicityly
    // set the constructor. Otherwise it will get overwritten.
    Board.prototype = {
        
        constructor: Board,

        init: function() {
          this.grid = ["", "", "", "", "", "", "", "", ""] // [0] -> top_left, [8] -> bottom_right
          this.occupied_spaces = 0          
        },

        clone: function() {
          return new Board(this.grid)
        },
      
        // will return false if not possible, otherwise will return the open space        
        has_one_move_to_win: function(color) {

          var ret_value = []
          var color_count;
          var open_count; // other_color_count always is 3 - color - open

          // go through all the rows and do a count
          var row;
          var col;

          var open_row
          var open_col

          //check rows
          for (row=0; row<3; row+=1) {
            color_count = 0
            open_count  = 0
            for (col=0; col<3; col+=1) {
              if (this.square_is_equal(row,col,color)) color_count += 1
              else if (this.square_is_valid(row,col)) {
                open_count += 1
                open_row    = row
                open_col    = col
              }
            }
            //console.log("row = "+row+"column = "+col+" color = "+color+"equal = "+
            //  this.is_equal(row,col,color)+"is_open = "+)
            if (color_count === 2 && open_count === 1) { 
              //return { row: open_row, column: open_col}
              ret_value.push( { row: open_row, column: open_col} )
            }
          }

          //check columns
          for (col=0; col<3; col+=1) {
            color_count = 0
            open_count  = 0
            for (row=0; row<3; row+=1) {
              if (this.square_is_equal(row,col,color)) color_count += 1
                else if (this.square_is_valid(row,col)) {
                open_count += 1
                open_row    = row
                open_col    = col
              }
            }
            if (color_count === 2 && open_count === 1) { 
              //return { row: open_row, column: open_col}
              ret_value.push( { row: open_row, column: open_col} )
            }
          }

          // check downward diagonal
          color_count = 0
          open_count  = 0
          for (row=0; row<3; row+=1) {
            col=row;
              if (this.square_is_equal(row,col,color)) color_count += 1
              else if (this.square_is_valid(row,col)) {
                open_count += 1
                open_row    = row
                open_col    = col
              }
          }
          if (color_count === 2 && open_count === 1) { 
            //return { row: open_row, column: open_col}
            ret_value.push ( { row: open_row, column: open_col} )
          }

          // check upward diagonal
          color_count = 0
          open_count  = 0
          for (row=0; row<3; row+=1) {
            col=2-row;
              if (this.square_is_equal(row,col,color)) color_count += 1
              else if (this.square_is_valid(row,col)) {
                open_count += 1
                open_row    = row
                open_col    = col
              }
          }
          if (color_count === 2 && open_count === 1) { 
            //return { row: open_row, column: open_col}
            ret_value.push ( { row: open_row, column: open_col} )
          }
          if (ret_value.length > 0) return ret_value
          return false
        },

        // is_winner returns either false or else an array of the winning indices, this array is truthy
        is_winner: function(color) {
          //console.log("Board.prototype.is_winner invoked")
          var row;
          var col;
          var match;
          var indices;

          // check rows
          for (row=0; row<3; row+=1) {
            match = true;
            indices = []
            for (col=0; col<3; col+=1) {
              if (this.square_is_not_equal(row,col,color)) { match = false }
              else indices.push({row: row, column: col})
            }
            if (match) { return indices }
          }
          // check cols
          for (col=0; col<3; col+=1) {
            match = true;
            indices = []
            for (row=0; row<3; row+=1) {
              if (this.square_is_not_equal(row,col,color)) { match = false }
              else indices.push({row: row, column: col})
            }
            if (match) { return indices }
          }
          // check downward diagonal
          match = true;
          indices = []
          for (row=0; row<3; row+=1) {
            col=row;
            if (this.square_is_not_equal(row,col,color)) { match = false }
            else indices.push({row: row, column: col})
          }
          if (match) { return indices }
          // check upward diagonal
          match = true;
          indices = []
          for (row=0; row<3; row+=1) {
            col=2-row;
            if (this.square_is_not_equal(row,col,color)) { match = false }
            else indices.push({row: row, column: col})
          }
          if (match) { return indices }
          return false;
        },
        
        is_full: function() {
          if (this.occupied_spaces >= 9) { return true }
          return false;
        },
        
        mark: function(row, column, color) {
          //console.log("Board.prototype.mark invoked with "+row+", "+column+", "+color)
          if (this.square_is_valid(row, column)) {
            this.set_cell(row, column, color)
            this.occupied_spaces += 1
            return true
          }
          return false
        },
        
        square_is_valid: function(row, column) {
          return this.square_is_equal(row, column, "")
        },
        
        set_cell: function(row, column, color) {
          var index = Number(row)*3 + Number(column)
          //console.log("set_cell: index = "+index)
          this.grid[index] = color
          //console.log(this.grid)
        },
        
        get_cell: function(row, column) {
          var index = Number(row)*3 + Number(column)
          //console.log("get_cell: index = "+index)
          return this.grid[index]
        },
        
        square_is_equal: function(row, column, value) {
          return this.get_cell(row, column) === value
        },
        
        square_is_not_equal: function(row, column, value) {
          return this.get_cell(row, column) !== value
        },

        all_squares: function() {

          function index2_row_col(index) { 
            return {
            row:    Math.floor(index / 3),
            column: (index % 3)
            }
          }

          return [0,1,2,3,4,5,6,7,8].map(function(index) {
            return index2_row_col(index)
          })
        },

        open_squares: function() {
          return this.filter_squares("")
        },

        // provide a general mechanism for the opponent to select possible moves
        filter_squares: function(color) {
      
          var this_boards = this
          return this.all_squares().filter(function(elem) {
            return this_boards.square_is_equal(elem.row,elem.column,color)
          })

        },

    }


    var View = {
        
        init: function() {
          //console.log("View.init invoked")
          this.is_first_time = true
          this.reset()

        },

        reset: function() {

          var template = function(row,column) {
            var html_template = ""
            html_template += "<div id='r"+row+"_c"+column+"' class='square'>"
            html_template += "  <div class='content'>"
            html_template += "  </div>"
            html_template += "</div>"
            return html_template
          }
          // Note that the order of the following code is important, building the DOM must happen
          // prior to setting up the click handler. I believe there is another way to accomplish this.
          var game_board = $('#game_board');
          game_board.empty()
          GameController.all_squares().forEach(function(elem) {
            game_board.append(template(elem.row,elem.column))
          })
          //console.log("game_board")          
          //console.log(game_board)
          $(document).ready(function() {                            
            $('.square').off('click').on('click', function() {
              // id_row and col could be extracted from jQuery object 'this' downstream, but i think this is a view concern  
              var id_row = this.id.substring(1,2) // r0_c0
              var id_col = this.id.substring(4,5) // 01234       
              console.log("CLICK")
              console.log(GameController.is_humans_turn())
              if (GameController.is_humans_turn()) {
                GameController.mark(this,id_row,id_col)
              }
            })                     
          }) // document.ready 

          if (this.is_first_time) { alert("Batman goes first!!") }
          this.is_first_time = false
        },  

        select_square: function(row, column) {
          return $("#r"+row+"_c"+column)
        },

        render_square: function(e,attr,image) { 
          //console.log("render invoked")         
          // if image is not given, then an empty square will be returned and that is ok
          var template = function(attr,image) {
            var html_template = "";
            html_template += "<div class='content'>"
            if (image) { html_template +=   "<img "+attr+" src='"+image+"'>" }
            html_template += "</div>"
            return html_template
          }           
          $(e).empty(); // referring to the jQuery this object
          $(e).append(template(attr,image));
        },

        render_winner: function(winner_ary) {
          // Array.prototype.indexOf does not work with objects so we use this deep indexOf
          // http://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
          function arrayObjIndexOf(ary, elem) {
            for(var i = 0, len = ary.length; i < len; i++) {
              if (ary[i].row === elem.row && ary[i].column === elem.column) return i;
            }
            return -1;
           }
          // render winner squares by fading others
          GameController.all_squares()
            .filter(function(elem) {
              return arrayObjIndexOf(winner_ary,elem) === -1
            })
            .forEach( function(elem) {
              $("#r"+elem.row+"_c"+elem.column+" div").addClass("fade")
          })
        }
             
    }

    var Game = {
       
       current_player: function() {
          return this.pieces[this.current_player_index]
        },
       
       current_image: function() {
          return this.images[this.current_player_index]
       },
       
       current_attr: function() {
          return this.attr[this.current_player_index]
       },
       
       next_player: function() {
         this.current_player_index = (this.current_player_index + 1) % 2
       },      
       

       init: function() { 
         this.pieces = ["Batman", "Joker"] // Batman, Joker
         // not sure if image and attr should be inside of game. more of a view thing unless it 
         // can be changed, ie selected by the user
         
         this.images = ["https://d13yacurqjgara.cloudfront.net/users/121576/screenshots/1111290/batman_logo_final.png", 
                        "https://s-media-cache-ak0.pinimg.com/236x/aa/6e/8d/aa6e8d0ba1ee3a0fea3df7c7d5b00f6b.jpg"]
         this.attr   = ["class='circle'", ""] // batman is a circle, jocker is a square
                  
         /*this.images = ["images/batman_logo_final.png", "images/aa6e8d0ba1ee3a0fea3df7c7d5b00f6b.jpg"]
         this.attr   = ["class='circle'", ""] // batman is a circle, jocker is a square         
         */
         this.current_player_index = 0
       }

    }

    var GameController = {
      
      // note board refees to the main board instance
      all_squares: function() {
        return board.all_squares()
      },

      mark: function(e, row, column) {
        //console.log("GameController.mark invoked")
        var current_player = Game.current_player()
        var player_wins = false
        var draw        = false
        var winner
        var joker
        var joker_move

        if (board.mark(row, column, current_player) ) {
          View.render_square(e, Game.current_attr(), Game.current_image())
          winner = board.is_winner(current_player)
          if (winner) {
            //console.log(winner)
            player_wins = true;
            View.render_winner(winner)
            alert(current_player+" wins. Click OK to begin a new game.")
          } else if (board.is_full()) {
              draw = true
              alert("The game is a draw. Click OK to begin a new game")
          } else {
              Game.next_player()
          }
          if (player_wins || draw) {
            Game.init()
            board.init()
            Opponent.init()
            View.reset()
          } else {
          // check for 1 player game and if so then AI's moves
            setTimeout( function() { 
              if (!this.is_a_two_player_game) {
                joker_move = Opponent.choose_square()
                console.log(joker_move)
                current_player = Game.current_player()
                board.mark(joker_move.row, joker_move.column, current_player)
                View.render_square(
                  View.select_square(joker_move.row,joker_move.column),
                  Game.current_attr(),
                  Game.current_image()
                )
                winner = board.is_winner(current_player)
                if (winner) {
                  player_wins = true
                  View.render_winner(winner)
                  alert(current_player+" wins. Click OK to begin a new game.")
                } else if (board.is_full()) { // not possible since human has last move
                  draw = true
                  alert("The game is a draw. Click OK to begin a new game")
                } else {
                  Game.next_player()
                }
                if (player_wins || draw) {
                  Game.init()
                  board.init()
                  Opponent.init()
                  View.reset()
                }
              } // if not this.is_a_...
            }
            ,1000) // setTimeout            
          } // else
        } // if board.mark

      },



      open_squares: function() { 
        return board.open_squares() 
      },
      
      is_square_open: function(row, column) {
        return board.square_is_valid(row, column) // is_Valid should be changed to is_open
      },

      is_humans_turn: function() {
        if (this.is_a_two_player_game) {
          return true
        } else {
          return Game.current_player() === 'Batman'
        }
      },

      clone_board: function() {
        return board.clone()
      },

      batman_has_center: function() {
        return board.square_is_equal(1,1,"Batman")
      },

      init: function() { 
        Game.init()        
        board = new Board()
        Opponent.init()
        View.init()
        this.is_a_two_player_game = false // changed to false for AI
      }
    };

    // need option for 2player game

    var board;
    GameController.init();
});
