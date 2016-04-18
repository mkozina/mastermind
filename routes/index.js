/*jshint node: true, esnext: true */

var _ = require("underscore");

// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
exports.index = function (req, res) {
    req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
    res.render('index', {
        title: 'Mastermind'
    });
};

exports.play = function (req, res) {
    var newGame = function () {
        var i, data = [],
            puzzle = req.session.puzzle;
        for (i = 0; i < puzzle.size; i += 1) {
            data.push(Math.floor(Math.random() * puzzle.dim)+1);
        }
        req.session.puzzle.data = data;
        return {
//			"data": puzzle.data,
            "size": puzzle.size,
			"dim": puzzle.dim,
			"max": puzzle.max
        };
    };
    // poniższa linijka jest zbędna (przy założeniu, że
    // play zawsze używany będzie po index) – w końcowym
    // rozwiązaniu można ją usunąć.
    req.session.puzzle = req.session.puzzle || req.app.get('puzzle');
    /*
     * req.params[2] === wartość size
     * req.params[4] === wartość dim
     * req.params[6] === wartość max
     */
    if (req.params[2]) {
        req.session.puzzle.size = req.params[2];
    }
	if (req.params[4]) {
        req.session.puzzle.dim = req.params[4];
    }
	if (req.params[6]) {
        req.session.puzzle.max = req.params[6];
    }
    res.json(newGame());
};

exports.mark = function (req, res) {
    var markAnswer = function () {
        var move = req.params[0].split('/');
		var puzzle = req.session.puzzle;
        move = move.slice(0, move.length - 1);
		console.log(puzzle.data);
        console.log(move);
		var codeCount = _.countBy(puzzle.data, (n) => n);
		var moveCount = _.countBy(move, (n) => n);
//		console.dir(codeCount);
//		console.dir(moveCount);
		var codeWithout = _.pick(codeCount,_.keys(moveCount));
//		console.dir(codeWithout);
		var moveWithout = _.pick(moveCount,_.keys(codeCount));
//		console.dir(moveWithout);
		var zipCM = _.zip(puzzle.data, move);
//		console.dir(zipCM);
		var onlyBlack = (_.map(zipCM, pair => {
			if(_.first(pair) == _.last(pair)){
				return _.first(pair);
			} else {
				return 0;
			}
		}));
		console.dir(onlyBlack);
		var blackCount = _.omit(_.countBy(onlyBlack, (n) => n), 0);
//		console.dir(blackCount);
		var blackNum = _.reduce(onlyBlack, (mem, val) => {
			if(val>0) return mem+1;
			else return mem;
		}, 0);
//		console.dir(blackNum)
		var codeRed = _.mapObject(codeWithout, (val, key) => {
			if( _.isEmpty(_.pick(blackCount, key)) )
				return val - 0;
			else
				return val - _.first(_.values(_.pick(blackCount, key)));
		})
		var moveRed = _.mapObject(moveWithout, (val, key) => {
			if( _.isEmpty(_.pick(blackCount, key)) )
				return val - 0;
			else
				return val - _.first(_.values(_.pick(blackCount, key)));
		});
//		console.dir(codeRed);
//		console.dir(moveRed);
		var whiteCount = _.mapObject(moveRed, (val, key) => {
			return _.min([val, _.first(_.values(_.pick(codeRed, key)))]);
		});
//		console.dir(whiteCount);
		var onlyWhite = (_.map(zipCM, pair => {
			if(_.first(pair) != _.last(pair) && _.first(_.values(_.pick(whiteCount,_.last(pair))))>0 ){
				whiteCount = _.mapObject(whiteCount, (val, key) => {
					if(key==_.last(pair)) return val-1;
					else return val;
				})
				return Number(_.last(pair));
			} else {
				return 0;
			}
		}));
		console.dir(onlyWhite);
		if(blackNum==puzzle.size){
			award = "cienko mocno";
		} else if(blackNum==(puzzle.size/2)){
			award = "cienko slabo";
		} else {
			award = "cienko cienko";
		}
        return {
            "blackVal": onlyBlack,
			"whiteVal": onlyWhite,
            "award": award
        };
    };
    res.json(markAnswer());
};
