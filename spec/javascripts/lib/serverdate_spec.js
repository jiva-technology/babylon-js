/*global ServerDate: false */

describe("ServerDate", function() {

  describe('Class property "skew"', function () {
    it('should default to 0', function () {
      expect( ServerDate.skew ).toEqual( 0 );
    });

    it('should be possible to change', function () {
      ServerDate.skew = -20;

      expect( ServerDate.skew ).toEqual( -20 );

      ServerDate.skew = 20;

      expect( ServerDate.skew ).toEqual( 20 );
    });
  });

  describe('Class when initialized', function () {
    describe('with no parameters', function () {
      it('should return time that is ahead of Date by "skew" ms', function () {
        ServerDate.skew = 0;

        var server_date = (new ServerDate()).valueOf();
        var date        = (new Date()).valueOf();
        expect( Math.round( server_date / 1000 ) ).toEqual( Math.round( date / 1000 ) );

        ServerDate.skew = 3000;
        server_date = (new ServerDate()).valueOf();
        date        = (new Date()).valueOf();
        expect( Math.round( server_date / 1000 ) ).toEqual( Math.round( ( date + 3000 ) / 1000 ) );

        ServerDate.skew = -6000;
        server_date = (new ServerDate()).valueOf();
        date        = (new Date()).valueOf();
        expect( Math.round( server_date / 1000 ) ).toEqual( Math.round( ( date - 6000 ) / 1000 ) );

        ServerDate.skew = -12000;
        server_date = (new ServerDate()).valueOf();
        date        = (new Date()).valueOf();
        expect( Math.round( server_date / 1000 ) ).toEqual( Math.round( ( date - 12000 ) / 1000 ) );
      });
    });
  });

  describe('ECMA 262 Edition 1', function () {

    describe('15.9.1.1', function () {
      it('should have the correct time range moving ahead of 1970', function() {

        /**
           Description:
           - leap seconds are ignored
           - assume 86400000 ms / day
           - numbers range fom +/- 9,007,199,254,740,991
           - ms precision for any instant that is within
           approximately +/-285,616 years from 1 jan 1970
           UTC
           - range of times supported is -100,000,000 days
           to 100,000,000 days from 1 jan 1970 12:00 am
           - time supported is 8.64e5*10e8 milliseconds from
           1 jan 1970 UTC  (+/-273972.6027397 years)

           -   this test generates its own data -- it does not
           read data from a file.
           Author:             christine@netscape.com
           Date:               7 july 1997

           every one hundred years contains:
             24 years with 366 days

           every four hundred years contains:
             97 years with 366 days
            303 years with 365 days

            86400000*365*97    =    3067372800000
           +86400000*366*303   =  + 9555408000000
                               =    1.26227808e+13

        */

        var four_hundred_years = 1.26227808e+13;

        var m_secs;
        var current_year;

        for ( m_secs = 0, current_year = 1970;
              m_secs < 8640000000000000;
              m_secs += four_hundred_years, current_year += 400 ) {
          var year = (new ServerDate( m_secs )).getUTCFullYear();
          expect( year ).toBeDefined();
        }
      });

      it('should have the correct time range moving behind 1970', function() {

        /*
           Description:
           - leap seconds are ignored
           - assume 86400000 ms / day
           - numbers range fom +/- 9,007,199,254,740,991
           - ms precision for any instant that is within
           approximately +/-285,616 years from 1 jan 1970
           UTC
           - range of times supported is -100,000,000 days
           to 100,000,000 days from 1 jan 1970 12:00 am
           - time supported is 8.64e5*10e8 milliseconds from
           1 jan 1970 UTC  (+/-273972.6027397 years)

           -   this test generates its own data -- it does not
           read data from a file.
           Author:             christine@netscape.com
           Date:               7 july 1997

           every one hundred years contains:
             24 years with 366 days

           every four hundred years contains:
             97 years with 366 days
            303 years with 365 days

            86400000*365*97    =    3067372800000
           +86400000*366*303   =  + 9555408000000
                               =    1.26227808e+13
        */

        var four_hundred_years = 1.26227808e+13;

        var m_secs;
        var current_year;

        for ( m_secs = 0, current_year = 1970;
              m_secs > 8640000000000000;
              m_secs -= four_hundred_years, current_year -= 400 ) {
          var year = (new ServerDate( m_secs )).getUTCFullYear();
          expect( year ).toBeDefined();
        }
      });
    });

  });


  describe('ECMA 3.1', function () {
    describe('15.9.3.2', function () {
      it('should return NaN for invalid date strings', function () {
        var invalidDateStrings = [
          "70/70/70",
          "70/70/1970",
          "70/70/2004"
        ];

        for (var i = 0; i < invalidDateStrings.length; i++) {
          var date = new ServerDate(invalidDateStrings[i]);

          expect( isNaN(date) ).toBeTruthy();
        }
      });
    });
  });
});
