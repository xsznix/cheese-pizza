var Dates = (function (Dates, undefined) {

	function isToday(m) {
		return m.clone().startOf('day').isSame(moment().startOf('day'));
	}

	function isThisWeek (m) {
		return m.clone().startOf('week').isSame(moment().startOf('week'));
	}

	Dates.shortRel = function (date) {
		var m = moment(date);
		if (isToday(m))
			return m.format('h:mma');
		if (isThisWeek(m))
			return m.format('ddd h:mma');
		return m.format('ddd M/D');
	}

	Dates.longRel = function (date) {
		var m = moment(date);
		if (isThisWeek(m))
			return m.fromNow();
		return m.format('dddd M/D [at] h:mma');
	}

	return Dates;

})(Dates || {});