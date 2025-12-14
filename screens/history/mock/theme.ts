import {COLOR_THEME} from '@/style/ColorTheme';
import {Platform} from 'react-native';
import {Theme} from 'react-native-calendars/src/types';

export const themeColor = COLOR_THEME.base.primary;
export const lightThemeColor = '#f2f7f7';

export function getTheme() {
  const disabledColor = 'grey';

  return {
    // arrows
    arrowColor: 'black',
    arrowStyle: {padding: 10}, // Tăng padding để tăng vùng touch
    // knob
    expandableKnobColor: themeColor,
    // month
    monthTextColor: COLOR_THEME.base.primary,
    textMonthFontSize: 19,
    textMonthFontFamily: 'Poppins-Regular',
    textMonthFontWeight: 'bold' as const,
    // day names
    textSectionTitleColor: 'black',
    textDayHeaderFontSize: 12,
    textDayHeaderFontFamily: 'Poppins-Regular',
    textDayHeaderFontWeight: 'normal' as const,
    // dates
    dayTextColor: themeColor,
    todayTextColor: '#af0078',
    textDayFontSize: 12,
    textDayFontFamily: 'Poppins-Regular',
    textDayFontWeight: '900' as const,
      textDayStyle: {marginTop: 0},
    // selected date
    selectedDayBackgroundColor: themeColor,
    selectedDayTextColor: 'white',
    // disabled date (ngày ngoài tháng)
    textDisabledColor: '#cccccc', // Màu xám cho ngày ngoài tháng
    // dot (marked date)
    dotColor: themeColor,
    selectedDotColor: 'white',
    disabledDotColor: disabledColor,
    dotStyle: {marginTop: -2},
    stylesheet: {
      calendar: {
        main: {
          paddingTop: 0,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 0,
          marginBottom: 0,
          marginTop: 0,
          backgroundColor: 'transparent',
        },
        week: {
          marginTop: 0,
          marginBottom: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          minHeight: 60,
          height: 60,
        },
      },
      'stylesheet.day.basic': {
        today: {
          backgroundColor: COLOR_THEME.base.primary,
          borderRadius: 16,
        },
        todayText: {
          color: '#fff',
        },
      },
      'stylesheet.calendar-list': {
        container: {
          paddingBottom: 0,
        },
      },
      'stylesheet.expandable': {
        main: {
          paddingBottom: 0,
          marginBottom: 0,
          paddingTop: 0,
          marginTop: 0,
        },
        knob: {
          marginBottom: 0,
          marginTop: 0,
        },
        knobContainer: {
          marginBottom: 0,
          marginTop: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },
        container: {
          paddingBottom: 0,
          marginBottom: 0,
          paddingTop: 0,
          marginTop: 0,
        },
        weekContainer: {
          marginBottom: 0,
          paddingBottom: 0,
        },
      },
    },
  } as Theme;
}
