


var util 		= require( 'util' );
	twitter		= require( 'twitter-api' ).createClient();


twitter.setAuth(
	'DhA091XQ8JNtGZxEpD6asQ',
    '24aDIc0P3Mv2ZVeYPN9oCIiVds9r6A4bHvwY7PaT4',
    '43489522-gapOKQ0UGvSAGpRR3BH4AmBS6kWW0YFNT7tpURhdr',
    'ggz7nhsDXEtJDHZOTdLsviNSBRiKVKggfol1Z2Wj0'
);


twitter.get( 'application/rate_limit_status', { ressource : 'statuses' }, function( data, error, status ) {

	if( error ) {

		console.error( 'Status '+status+', failed to fetch application rate limit status' );
		return;

	}

	console.log( util.inspect( data.resources.statuses ) );

});

exports.twitter = twitter;