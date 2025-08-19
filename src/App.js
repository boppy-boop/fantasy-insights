import React, { useState } from 'react';

// Main App component
const App = () => {
  // Hardcoded data for Power Rankings (from previous responses)
  const powerRankingsData = [
    {
      rank: 1,
      team: 'NBAngryWolfDan',
      analysis: 'The top of the heap. This team is an absolute juggernaut. They paid up for De\'Von Achane ($50) and Bucky Irving ($30), two of the most explosive running backs in the league. They also got a great value on Isiah Pacheco ($11), another great running back. But their true strength is their wide receiver corps. Jaxon Smith-Njigba ($45) and Cooper Kupp ($3) are both excellent values. They also got a top-tier quarterback in Justin Herbert for a shockingly low price of $3. This team is deep, talented, and has a great mix of youth and experience. They are the clear-cut favorite to win the league.',
      likelihood: 'Extremely high. This is the team to beat.',
      players: [
        { name: 'De\'Von Achane', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360310.png' },
        { name: 'Bucky Irving', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4802873.png' },
        { name: 'Isiah Pacheco', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4429930.png' },
        { name: 'Jaxon Smith-Njigba', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432168.png' },
        { name: 'Cooper Kupp', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3042510.png' },
        { name: 'Justin Herbert', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241478.png' },
      ]
    },
    {
      rank: 2,
      team: 'Scary Terry\'s Terror Squad',
      analysis: 'This team is loaded with talent. They paid up for Alvin Kamara ($50) and Kenneth Walker III ($46), two solid running backs. But their real strength is at the wide receiver position. Garrett Wilson ($34), Travis Hunter ($17), and DeVonta Smith ($31) are all excellent values. They also got Jayden Daniels for $30, who could be a league-winner at quarterback. They even managed to get a great tight end in Travis Kelce for a shockingly low price of $18. This team is a well-oiled machine, and they are a legitimate championship contender.',
      likelihood: 'Extremely high. This team is a favorite to win it all.',
      players: [
        { name: 'Alvin Kamara', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127326.png' },
        { name: 'Kenneth Walker III', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430489.png' },
        { name: 'Garrett Wilson', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432172.png' },
        { name: 'Travis Hunter', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092026.png' }, // College ID, might not be NFL headshot
        { name: 'DeVonta Smith', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4262921.png' },
        { name: 'Jayden Daniels', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432152.png' },
        { name: 'Travis Kelce', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/2577418.png' },
      ]
    },
    {
      rank: 3,
      team: 'The Bengal King',
      analysis: 'This is a well-built, well-balanced team. They paid up for Jahmyr Gibbs ($92), who will be a workhorse for them. They also snagged Tyreek Hill ($50), an excellent value for a top-tier wide receiver. Their quarterback situation is also solid, with Joe Burrow ($34) and Trevor Lawrence ($1) at their disposal. They got some great values on the backend of the draft, including Travis Etienne Jr. ($10) and Nick Chubb ($1), who could both be huge contributors. This team has a lot of upside and is a real threat to win it all.',
      likelihood: 'Very high. This team is well-rounded and has a ton of potential.',
      players: [
        { name: 'Jahmyr Gibbs', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432153.png' },
        { name: 'Tyreek Hill', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3051439.png' },
        { name: 'Joe Burrow', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241477.png' },
        { name: 'Travis Etienne Jr.', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360311.png' },
        { name: 'Nick Chubb', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127320.png' },
      ]
    },
    {
      rank: 4,
      team: '#firebevell',
      analysis: 'This team is a contender, plain and simple. They paid up for Christian McCaffrey ($91) and Puka Nacua ($76), a dynamic duo that could lead them to a championship. The value on McCaffrey is a bit pricey, but Nacua at $76 is a steal. They also snagged a top-tier tight end in Sam LaPorta for just $22, which is an absolute crime. They also got a great value on Patrick Mahomes ($23) late in the draft. The rest of their roster is a bit thin, but their top-end talent is enough to overcome it. They have a good mix of veterans and young talent, and they are a real threat to win it all.',
      likelihood: 'Very high. They have the top-end talent to win it all.',
      players: [
        { name: 'Christian McCaffrey', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127325.png' },
        { name: 'Puka Nacua', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4688970.png' },
        { name: 'Sam LaPorta', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4568019.png' },
        { name: 'Patrick Mahomes', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png' },
      ]
    },
    {
      rank: 5,
      team: 'Stroud Control',
      analysis: 'Stroud Control is a strong team on paper. They paid up for some expensive rookies, including Rome Odunze ($34), Malik Nabers ($54), and Brock Bowers ($26). But their true value comes from their running back corps. TreVeyon Henderson ($33) and Kyren Williams ($43) are both excellent values and could be league-winners. They also have a solid quarterback in Bo Nix ($15), a low-cost, high-upside option. The team has a great blend of established talent and high-upside rookies. They are a well-rounded team that\'s a threat to win it all.',
      likelihood: 'High. This team is a dark horse to win the whole thing.',
      players: [
        { name: 'Rome Odunze', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092027.png' },
        { name: 'Malik Nabers', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092028.png' },
        { name: 'Brock Bowers', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092029.png' },
        { name: 'TreVeyon Henderson', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092030.png' },
        { name: 'Kyren Williams', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430490.png' },
        { name: 'Bo Nix', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432154.png' },
      ]
    },
    {
      rank: 6,
      team: 'Pimp Named Slickback',
      analysis: 'This team is one of the more interesting rosters. They paid a king\'s ransom for Ja\'Marr Chase ($104) and Ashton Jeanty ($80), two high-end players. The problem is, they spent a whopping $184 on two players, leaving them with very little money to fill out the rest of their roster. They did manage to get some value with Joe Mixon ($14) and D\'Andre Swift ($19), but the rest of their bench is a collection of low-cost fliers. Their quarterback situation is also a bit shaky, with Brock Purdy and Kyler Murray as their two options. They will be a force to be reckoned with on a week-to-week basis, but their lack of depth could be their undoing.',
      likelihood: 'Decent. If their top two players stay healthy, they can be a real threat.',
      players: [
        { name: 'Ja\'Marr Chase', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360312.png' },
        { name: 'Ashton Jeanty', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092031.png' },
        { name: 'Joe Mixon', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3043078.png' },
        { name: 'D\'Andre Swift', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241479.png' },
      ]
    },
    {
      rank: 7,
      team: 'No Rookies',
      analysis: 'The "No Rookies" team name is either a bold statement or a cry for help. Either way, they paid up for Ladd McConkey ($65) and Trey McBride ($58), who are both solid players. They also got a great value on Tony Pollard for $26. But the rest of their draft was a masterclass in mediocrity. Lamar Jackson for $55 is an outstanding value and could be a league-winner. James Cook for $55 is another solid pick. They have a good starting lineup, but their bench is as uninspiring as their team name. They have some potential, but their lack of depth could come back to haunt them.',
      likelihood: 'Better than average. If their top players stay healthy, they can compete.',
      players: [
        { name: 'Ladd McConkey', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092032.png' },
        { name: 'Trey McBride', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430491.png' },
        { name: 'Lamar Jackson', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3916387.png' },
        { name: 'James Cook', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430492.png' },
      ]
    },
    {
      rank: 8,
      team: 'Dr. Tran',
      analysis: 'Dr. Tran seems to have a good feel for value, but their team is a bit of a Frankenstein monster. They paid up for Jonathan Taylor at $65, which is a solid price for a top-10 running back. Their biggest swing was Josh Allen for $61, a top-tier quarterback at a respectable price. However, the rest of their picks are a mix of veterans and rookies. Omarion Hampton for $58 is a massive leap of faith, and Chuba Hubbard for $42 is a bit rich for my taste. They got some good value on their bench, with guys like Jayden Reed and Jordan Love, but the starting lineup is a bit disjointed. They\'ll be good, but not great.',
      likelihood: 'Possible. They have some high-end talent, but the overall roster is a bit soft.',
      players: [
        { name: 'Jonathan Taylor', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241480.png' },
        { name: 'Josh Allen', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3916388.png' },
        { name: 'Omarion Hampton', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092033.png' },
        { name: 'Chuba Hubbard', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241481.png' },
      ]
    },
    {
      rank: 9,
      team: 'Edmonton End-Zone Elite',
      analysis: 'The Canadian connection comes in at number nine, but they\'ll need to channel more than their inner Wayne Gretzky to win. They were a budget-conscious team from the start, snagging Amon-Ra St. Brown for a relatively fair $85 and Nico Collins for a steal at $65. This Houston stack could be a league-winner. However, the rest of their roster is just... there. Josh Jacobs for $57 is a classic example of paying for a name from a couple years ago. Baker Mayfield for $8 is a great value, but can he sustain his production? This team has a decent starting lineup, but their bench is a collection of guys that make you go, "Oh, yeah, he\'s still in the league." They did well on value but didn\'t take enough risks to become truly great.',
      likelihood: 'Middling. They\'ll be a tough out on a week-to-week basis, but a championship is a stretch.',
      players: [
        { name: 'Amon-Ra St. Brown', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360313.png' },
        { name: 'Nico Collins', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360314.png' },
        { name: 'Josh Jacobs', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241482.png' },
        { name: 'Baker Mayfield', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127327.png' },
      ]
    },
    {
      rank: 10,
      team: 'Wasted Money',
      analysis: 'The Wasted Money manager seems to have a flair for the dramatic. They paid a ridiculous $92 for CeeDee Lamb, which is a bit of a head-scratcher when Justin Jefferson went for $2 less. Then they paid up for Derrick Henry ($82) and Drake London ($57). This team is all about the big names, consequences be damned. They have a solid core, but their bench is a graveyard of players they got for cheap. Mark Andrews for $15 is an absolute steal and a potential league-winner, but the rest of their supporting cast is not going to win them any games. They got their guys, but the "wasted money" might be the most accurate team name in the league.',
      likelihood: 'Average. They have a great starting lineup, but no depth to speak of.',
      players: [
        { name: 'CeeDee Lamb', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241483.png' },
        { name: 'Derrick Henry', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3051438.png' },
        { name: 'Drake London', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432173.png' },
        { name: 'Mark Andrews', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127328.png' },
      ]
    },
    {
      rank: 11,
      team: 'Saquon Two Three Four',
      analysis: 'This team is named after their most expensive player, and for good reason. They went all in on the big names, shelling out a massive $122 for Saquon Barkley and a hefty $96 for Tee Higgins. Their draft was a masterpiece of "I\'m not here to mess around." They paid up for who they wanted and got them, including a great value on Dak Prescott for $36. They also splurged on the consensus top defense, the Eagles, for a league-high $12. So why are they so low? Their roster has some holes, particularly at the WR position after Higgins, and their bench is a hodgepodge of forgotten players and fliers. They have a great foundation, but if Barkley or Higgins underperforms, the entire house of cards will come crashing down.',
      likelihood: 'Decent, but they have no margin for error.',
      players: [
        { name: 'Saquon Barkley', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3916389.png' },
        { name: 'Tee Higgins', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241484.png' },
        { name: 'Dak Prescott', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/2976210.png' },
      ]
    },
    {
      rank: 12,
      team: 'The Jonathan Taylors',
      analysis: 'The Jonathan Taylors were a bit of a mixed bag. They snagged Marvin Harrison Jr. for a decent price ($42), but then proceeded to build a roster full of landmines. Jaylen Waddle and Chris Olave for $22 and $11 respectively is an absolute steal. However, they\'re surrounded by an army of question marks. Elijah Arroyo for $4? Who? I\'m sorry, I\'m not familiar with the former XFL tight end. Brian Robinson Jr. for $16 is a solid flex play, but their quarterback situation is a mess, with Justin Fields at $10 and Cam Ward at $1. They got some decent value on some players, but the overall roster is a volatile mix of high-upside rookies and veterans on the decline. This team will either shock the world or completely self-destruct. It’s a boom-or-bust squad, and I\'m leaning towards bust.',
      likelihood: 'A coin flip. But the coin is weighted.',
      players: [
        { name: 'Marvin Harrison Jr.', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092034.png' },
        { name: 'Jaylen Waddle', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360315.png' },
        { name: 'Chris Olave', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432174.png' },
        { name: 'Brian Robinson Jr.', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430493.png' },
      ]
    },
    {
      rank: 13,
      team: 'BDB\'z',
      analysis: 'The BDB\'z came into this draft with one goal: secure top-tier talent. And they did, paying a king\'s ransom for Justin Jefferson ($90) and Bijan Robinson ($101). Together, those two cost them a whopping $191, over half of their starting budget. The value on Justin Jefferson at $90 is actually pretty solid, but Bijan at $101 is a big swing. After that, the roster is a desolate wasteland. George Kittle for $45 is fine, but who is he catching passes from? Trevor Lawrence, who they got for a dollar. They then proceeded to draft a bunch of guys for a buck or two, a clear sign they were scraping the bottom of the barrel. J.K. Dobbins and Jaylen Warren are decent handcuffs, but this team has zero depth. If either Jefferson or Robinson goes down, BDB\'z is officially dead in the water. They are a one-hit wonder with two hits.',
      likelihood: 'Low. They are entirely dependent on their top two picks staying healthy and playing at an elite level.',
      players: [
        { name: 'Justin Jefferson', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241485.png' },
        { name: 'Bijan Robinson', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432175.png' },
      ]
    },
    {
      rank: 14,
      team: 'D&B',
      analysis: 'Look, D&B\'s draft strategy was simple: buy a bunch of decent players and hope for the best. With a league-low budget of $258, they had no choice but to be frugal. The problem is, they were too frugal. Jalen Hurts for $37 is a bargain, but is he enough to carry this team? The rest of the roster is a collection of names that sound like they belong in the mid-2010s: James Conner, Mike Evans, Terry McLaurin, and DK Metcalf. Not terrible, but certainly not a championship-caliber core. They\'ve got a lot of "if" players. *If* James Conner can stay healthy for more than three weeks, *if* Mike Evans can defy Father Time, and *if* DK Metcalf can actually produce on the Steelers, then maybe, just maybe, this team can compete for a playoff spot. But it\'s more likely they\'re competing for a consolation bracket trophy. Their late-round picks, like J.J. McCarthy and Dalton Kincaid, are pure speculation. They saved money, but for what? A one-way ticket to the basement of the standings.',
      likelihood: 'Slim to none. They have a prayer, but a very, very small one.',
      players: [
        { name: 'Jalen Hurts', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241486.png' },
        { name: 'James Conner', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3042511.png' },
        { name: 'Mike Evans', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/2577417.png' },
        { name: 'DK Metcalf', image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241487.png' },
      ]
    },
  ];

  // Hardcoded data for Steals & Overpays (from previous responses)
  const stealsOverpaysData = {
    steals: [
      {
        player: 'Travis Kelce',
        cost: '$18',
        team: 'Scary Terry\'s Terror Squad',
        reason: 'This is an absolute highway robbery. The greatest tight end of all time, the one with the most famous girlfriend on the planet, went for just $18. Are you kidding me? This is the kind of value that wins leagues. While some may argue his age is a factor, for $18, he could get half his normal production and still be a top-5 tight end. A true fantasy guru\'s dream.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/2577418.png'
      },
      {
        player: 'Patrick Mahomes',
        cost: '$23',
        team: '#firebevell',
        reason: 'I\'m not saying this guy is good or anything, but he has won a couple of Super Bowls. He\'s also been the QB1 in fantasy a few times. To get him for just $23 is a joke. It\'s like finding a brand new Ferrari for the price of a used Honda. You can\'t pass this up. This is a league-winning kind of value.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png'
      },
      {
        player: 'Justin Herbert',
        cost: '$3',
        team: 'NBAngryWolfDan',
        reason: 'The Chargers offense is a bit of a question mark this year, but a top-10 quarterback for $3 is an insane steal. That\'s a kicker price for a potential QB1. This is the kind of move that lets you pay up for your stud running backs and wide receivers. A fantastic value that lets you build a truly elite team.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241478.png'
      },
      {
        player: 'Mark Andrews',
        cost: '$15',
        team: 'Wasted Money',
        reason: 'It\'s in the team name, I guess, but this is a rare moment of brilliance from a "Wasted Money" manager. Mark Andrews is a consensus top-5 tight end, and he went for just $15. That\'s a TE1 for a price you\'d expect to pay for a mediocre bench player.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/3127328.png'
      },
      {
        player: 'Breece Hall',
        cost: '$43',
        team: 'The Bengal King',
        reason: 'Breece Hall is a top-10 running back, and he went for just $43. That\'s a steal. He has the potential to be a league-winner, and he went for a price that\'s far below his market value.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4430494.png'
      },
    ],
    overpays: [
      {
        player: 'Ja\'Marr Chase',
        cost: '$104',
        team: 'Pimp Named Slickback',
        reason: 'Look, I get it. Ja\'Marr Chase is a top-tier wide receiver. But $104? That\'s over a third of your starting budget on one player. He is not a $104 player, plain and simple. He\'s a great receiver, but that\'s a price that says "I have no faith in my ability to find value elsewhere." This is the kind of overpay that sinks a team before the season even starts.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4360312.png'
      },
      {
        player: 'Bijan Robinson',
        cost: '$101',
        team: 'BDB\'z',
        reason: 'A hundred and one dollars for a running back who has yet to prove he can be a top-5 fantasy producer. I\'m not saying he\'s not good. He\'s great. But is he "$101 great"? In a world where Christian McCaffrey went for $91, this is a massive overpay. This screams "I was desperate for a running back and panicked."',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432175.png'
      },
      {
        player: 'CeeDee Lamb',
        cost: '$92',
        team: 'Wasted Money',
        reason: 'The team name is truly a prophecy. You paid $92 for CeeDee Lamb, who is a fantastic wide receiver. The problem is, Justin Jefferson went for $90. You paid more for the second-best receiver in the draft. It\'s not a disaster, but it\'s a clear overpay that shows a lack of awareness of the market. You had to have him, and you paid for it.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4241483.png'
      },
      {
        player: 'Ashton Jeanty',
        cost: '$80',
        team: 'Pimp Named Slickback',
        reason: 'You already blew a third of your budget on Ja\'Marr Chase, and now you\'re paying $80 for a rookie running back who has yet to play a single down in the NFL. I know the hype is real, but $80 is the price you pay for a proven commodity, not a rookie. You\'ve gambled your entire season on two players, and if either one of them busts, you\'re toast.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/5092031.png'
      },
      {
        player: 'Jahmyr Gibbs',
        cost: '$92',
        team: 'The Bengal King',
        reason: 'Jahmyr Gibbs is a fantastic running back with a ton of potential. But $92 is a steep price for a guy who\'s still in a backfield with David Montgomery. This is a price you pay for a true workhorse, and while Gibbs is close, he\'s not quite there yet. You paid up for a player who has some risk attached, and that\'s not a great way to start a season.',
        image: 'https://a.espncdn.com/i/headshots/nfl/players/full/4432153.png'
      },
    ],
  };

  // Hardcoded data for Strength of Schedule (from previous responses)
  const strengthOfScheduleData = [
    {
      team: 'NBAngryWolfDan',
      grade: 'A-',
      analysis: 'This is a great schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 2',
        opponent: 'Scary Terry\'s Terror Squad',
        narrative: 'The top two titans clash early! This Week 2 showdown against Scary Terry\'s Terror Squad will set the tone for who truly rules this league. Expect fireworks and maybe a little trash talk.'
      }
    },
    {
      team: 'Scary Terry\'s Terror Squad',
      grade: 'A-',
      analysis: 'This is a great schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 12',
        opponent: 'The Bengal King',
        narrative: 'Forget Halloween, this Week 12 matchup against The Bengal King is the real fright night. A late-season battle with major playoff implications, where every catch and run could determine their destiny.'
      }
    },
    {
      team: 'The Bengal King',
      grade: 'A-',
      analysis: 'This is a great schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 1',
        opponent: 'Scary Terry\'s Terror Squad',
        narrative: 'Kicking off the season with a bang! This Week 1 slugfest against Scary Terry\'s Terror Squad is a true test of their championship aspirations right out of the gate. No time for a warm-up, King.'
      }
    },
    {
      team: '#firebevell',
      grade: 'A-',
      analysis: 'This is a great schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 10',
        opponent: 'NBAngryWolfDan',
        narrative: 'Circle Week 10 on your calendars, folks! #firebevell faces the league\'s top dog, NBAngryWolfDan. This is their chance to prove they\'re more than just a playoff hopeful – they\'re a legitimate threat to the throne.'
      }
    },
    {
      team: 'Stroud Control',
      grade: 'B+',
      analysis: 'This is a good schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 13',
        opponent: 'NBAngryWolfDan',
        narrative: 'A late-season gauntlet! Stroud Control gets a shot at the top-ranked NBAngryWolfDan in Week 13. This game could either solidify their playoff spot or send them spiraling into the wild card abyss.'
      }
    },
    {
      team: 'Pimp Named Slickback',
      grade: 'B+',
      analysis: 'This is a good schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 6',
        opponent: 'NBAngryWolfDan',
        narrative: 'Time to see if the pimp hand is strong! Facing the league leader, NBAngryWolfDan, in Week 6 is a prime opportunity for Pimp Named Slickback to make a statement. Or, you know, get humbled.'
      }
    },
    {
      team: 'No Rookies',
      grade: 'B+',
      analysis: 'This is a good schedule. You have a lot of manageable matchups, and you\'ll get to face off against some of the weaker teams in the league.',
      biggestGame: {
        week: 'Week 4',
        opponent: 'NBAngryWolfDan',
        narrative: 'The \'No Rookies\' philosophy gets its ultimate test in Week 4 against the top-ranked NBAngryWolfDan. Can veteran savvy overcome raw power? This is where we find out if experience truly trumps youth... or if it just means you\'re old.'
      }
    },
    {
      team: 'Dr. Tran',
      grade: 'B',
      analysis: 'This isn\'t a walk in the park, but it\'s not a death sentence either. You have some tough matchups, but there are enough manageable games to give you a fighting chance.',
      biggestGame: {
        week: 'Week 8',
        opponent: 'NBAngryWolfDan',
        narrative: 'A mid-season gut check! Dr. Tran faces the formidable NBAngryWolfDan in Week 8. This game will either be a stepping stone to respectability or a harsh dose of reality.'
      }
    },
    {
      team: 'Edmonton End-Zone Elite',
      grade: 'B-',
      analysis: 'This isn\'t a walk in the park, but it\'s not a death sentence either. You have some tough matchups, but there are enough manageable games to give you a fighting chance.',
      biggestGame: {
        week: 'Week 6',
        opponent: '#firebevell',
        narrative: 'The Canadian contingent gets a major challenge in Week 6 against #firebevell. This is their chance to prove they belong in the upper echelon, or just confirm they\'re happy being a middle-of-the-pack team.'
      }
    },
    {
      team: 'Wasted Money',
      grade: 'C+',
      analysis: 'This is a tough schedule for a team that has some holes. You\'ll need your stars to stay healthy and play at an elite level to have any chance.',
      biggestGame: {
        week: 'Week 5',
        opponent: '#firebevell',
        narrative: 'The \'Wasted Money\' squad gets a chance to redeem their draft spending in Week 5 against #firebevell. A win here would be huge for their playoff hopes, otherwise, it\'s just more money down the drain.'
      }
    },
    {
      team: 'Saquon Two Three Four',
      grade: 'C',
      analysis: 'This isn\'t a walk in the park, but it\'s not a death sentence either. You have some tough matchups, but there are enough manageable games to give you a fighting chance.',
      biggestGame: {
        week: 'Week 3',
        opponent: '#firebevell',
        narrative: 'An early season test! Saquon Two Three Four faces #firebevell in Week 3. This game will show if their top-heavy roster can hang with the league\'s contenders, or if they\'ll be stuck in neutral.'
      }
    },
    {
      team: 'BDB\'z',
      grade: 'B-',
      analysis: 'This isn\'t a walk in the park, but it\'s not a death sentence either. You have some tough matchups, but there are enough manageable games to give you a fighting chance.',
      biggestGame: {
        week: 'Week 8',
        opponent: '#firebevell',
        narrative: 'The BDB\'z get a brutal mid-season draw against #firebevell in Week 8. With their top-heavy roster, this game is either a statement win or a stark reminder of their lack of depth.'
      }
    },
    {
      team: 'The Jonathan Taylors',
      grade: 'F',
      analysis: 'This is a nightmare schedule. You\'re going to face a lot of strong teams, and you\'ll need a lot of luck to even make it to the playoffs.',
      biggestGame: {
        week: 'Week 1',
        opponent: 'NBAngryWolfDan',
        narrative: 'Welcome to the thunderdome, Jonathan Taylors! Kicking off the season against the league\'s top team, NBAngryWolfDan, is a baptism by fire. This game could define their season\'s narrative before it even properly begins.'
      }
    },
    {
      team: 'D&B',
      grade: 'D',
      analysis: 'The path to glory is a muddy, uphill battle. Your opponents are consistently stronger than you, and you\'ll need a lot of luck to even sniff the playoffs.',
      biggestGame: {
        week: 'Week 1',
        opponent: '#firebevell',
        narrative: 'Oh, D&B. Starting the season against #firebevell is like bringing a knife to a gunfight. This Week 1 matchup is less about winning and more about damage control. Good luck, you\'ll need it.'
      }
    },
  ];


  // Data structure for weekly "genres"
  const weeksData = [
    {
      id: 'preseason',
      title: 'Preseason Blitz: Draft Wrap-Up',
      description: 'A deep dive into the draft results and pre-season expectations, including power rankings, steals, overpays, and initial strength of schedule analysis.',
      image: 'https://placehold.co/600x400/4a0e7f/ffffff?text=Draft+Day+Blitz', // Dark purple/white for preseason
      content: {
        powerRankings: powerRankingsData,
        stealsOverpays: stealsOverpaysData,
        strengthOfSchedule: strengthOfScheduleData,
      },
    },
    {
      id: 'week1',
      title: 'Week 1: Kickoff Chaos',
      description: 'The regular season begins! Early takes and matchups that shook the fantasy world.',
      image: 'https://placehold.co/600x400/1e2a4a/ffffff?text=Kickoff+Chaos', // Dark blue/white
      content: {
        // Placeholder data for Week 1 - you can replace this with actual weekly insights
        powerRankings: [{ rank: 1, team: 'Placeholder Team 1', analysis: 'Week 1 analysis coming soon!', likelihood: 'Unknown' }],
        stealsOverpays: { steals: [], overpays: [] },
        strengthOfSchedule: [],
      },
    },
    {
      id: 'week2',
      title: 'Week 2: Early Season Showdowns',
      description: 'Recap of Week 2 battles and emerging trends. Who\'s hot and who\'s not?',
      image: 'https://placehold.co/600x400/6b2d3e/ffffff?text=Showdown+Sunday', // Burgundy/white
      content: {
        powerRankings: [{ rank: 1, team: 'Placeholder Team 2', analysis: 'Week 2 analysis coming soon!', likelihood: 'Unknown' }],
        stealsOverpays: { steals: [], overpays: [] },
        strengthOfSchedule: [],
      },
    },
    {
      id: 'week3',
      title: 'Week 3: The Contender\'s Crunch',
      description: 'Separating the contenders from the pretenders. Key injuries and waiver wire gems.',
      image: 'https://placehold.co/600x400/2f4f4f/ffffff?text=Contender+Crunch', // Dark slate gray/white
      content: {
        powerRankings: [{ rank: 1, team: 'Placeholder Team 3', analysis: 'Week 3 analysis coming soon!', likelihood: 'Unknown' }],
        stealsOverpays: { steals: [], overpays: [] },
        strengthOfSchedule: [],
      },
    },
    {
      id: 'week4',
      title: 'Week 4: Mid-Season Mayhem',
      description: 'Halfway point check-in. Who\'s making a playoff push, and who\'s already packing it in?',
      image: 'https://placehold.co/600x400/8b4513/ffffff?text=Mid-Season+Mayhem', // Saddle brown/white
      content: {
        powerRankings: [{ rank: 1, team: 'Placeholder Team 4', analysis: 'Week 4 analysis coming soon!', likelihood: 'Unknown' }],
        stealsOverpays: { steals: [], overpays: [] },
        strengthOfSchedule: [],
      },
    },
  ];

  // State to manage which week is currently active
  const [activeWeek, setActiveWeek] = useState(weeksData[0]); // Default to Preseason Blitz
  // State to manage which insight section is active within the selected week
  const [activeInsightSection, setActiveInsightSection] = useState('powerRankings');

  // Render the content for the selected insight section within the active week
  const renderInsightContent = () => {
    if (!activeWeek || !activeWeek.content) {
      return (
        <div className="text-white text-center text-xl mt-8">
          No insights available for this week yet. Check back soon!
        </div>
      );
    }

    const { content } = activeWeek;

    switch (activeInsightSection) {
      case 'powerRankings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">League Power Rankings</h2>
            {content.powerRankings && content.powerRankings.length > 0 ? (
              content.powerRankings.map((teamData) => (
                <div key={teamData.rank} className="bg-zinc-800 p-6 rounded-2xl shadow-xl shadow-zinc-950/50 border border-zinc-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-900/50">
                  <div className="flex items-center mb-3">
                    <h3 className="text-2xl font-semibold text-white mr-3">#{teamData.rank} {teamData.team}</h3>
                    {teamData.players && teamData.players.map((player, idx) => (
                      <img
                        key={idx}
                        src={player.image}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover mr-1 border-2 border-purple-500" // Increased size here
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} // Remove image if not found
                        title={player.name}
                      />
                    ))}
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-3">{teamData.analysis}</p>
                  <p className="text-sm text-zinc-400 italic">
                    <span className="font-medium">Likelihood of winning championship:</span> {teamData.likelihood}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">Power Rankings not yet available for this week.</p>
            )}
          </div>
        );
      case 'stealsOverpays':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">Draft Steals & Overpays</h2>

            {/* Steals Section */}
            <div className="bg-gradient-to-br from-green-950/40 to-green-900/30 p-6 rounded-2xl shadow-xl shadow-green-950/50 border border-green-800">
              <h3 className="text-2xl font-semibold text-green-300 mb-4">Top 5 Steals of the Draft 💰</h3>
              <div className="space-y-4">
                {content.stealsOverpays && content.stealsOverpays.steals.length > 0 ? (
                  content.stealsOverpays.steals.map((item, index) => (
                    <div key={index} className="bg-zinc-900/70 p-4 rounded-xl shadow-md shadow-zinc-950/50 border border-green-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-green-800/50">
                      <div className="flex items-center mb-2">
                        <img
                          src={item.image}
                          alt={item.player}
                          className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-green-500" // Increased size here
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          title={item.player}
                        />
                        <p className="font-bold text-xl text-green-200">{item.player} ({item.cost}) - {item.team}</p>
                      </div>
                      <p className="text-zinc-300 mt-1">{item.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400">Steals not yet available for this week.</p>
                )}
              </div>
            </div>

            {/* Overpays Section */}
            <div className="bg-gradient-to-br from-red-950/40 to-red-900/30 p-6 rounded-2xl shadow-xl shadow-red-950/50 border border-red-800">
              <h3 className="text-2xl font-semibold text-red-300 mb-4">Top 5 Overpays of the Draft 💸</h3>
              <div className="space-y-4">
                {content.stealsOverpays && content.stealsOverpays.overpays.length > 0 ? (
                  content.stealsOverpays.overpays.map((item, index) => (
                    <div key={index} className="bg-zinc-900/70 p-4 rounded-xl shadow-md shadow-zinc-950/50 border border-red-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-red-800/50">
                      <div className="flex items-center mb-2">
                        <img
                          src={item.image}
                          alt={item.player}
                          className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-red-500" // Increased size here
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          title={item.player}
                        />
                        <p className="font-bold text-xl text-red-200">{item.player} ({item.cost}) - {item.team}</p>
                      </div>
                      <p className="text-zinc-300 mt-1">{item.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400">Overpays not yet available for this week.</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'strengthOfSchedule':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-4">Strength of Schedule (SoS) Ratings</h2>
            {content.strengthOfSchedule && content.strengthOfSchedule.length > 0 ? (
              content.strengthOfSchedule.map((teamSoS) => (
                <div key={teamSoS.team} className="bg-zinc-800 p-6 rounded-2xl shadow-xl shadow-zinc-950/50 border border-zinc-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-900/50">
                  <h3 className="text-2xl font-semibold text-white mb-2">{teamSoS.team}</h3>
                  <p className="text-zinc-300 leading-relaxed">
                    <span className="font-medium">SoS Grade:</span> <span className={`font-bold ${teamSoS.grade === 'A+' ? 'text-emerald-400' : teamSoS.grade === 'A-' ? 'text-emerald-300' : teamSoS.grade === 'B+' ? 'text-lime-400' : teamSoS.grade === 'B' ? 'text-lime-300' : teamSoS.grade === 'B-' ? 'text-yellow-400' : teamSoS.grade === 'C+' ? 'text-yellow-300' : teamSoS.grade === 'C' ? 'text-orange-300' : teamSoS.grade === 'C-' ? 'text-orange-400' : teamSoS.grade === 'D+' ? 'text-red-300' : teamSoS.grade === 'D' ? 'text-red-400' : 'text-red-500'}`}>{teamSoS.grade}</span>
                  </p>
                  {teamSoS.biggestGame && (
                    <div className="mt-4 p-3 bg-zinc-700 rounded-lg border border-zinc-600 shadow-inner">
                      <p className="font-semibold text-purple-300">🔥 Biggest Game: {teamSoS.biggestGame.week} vs. {teamSoS.biggestGame.opponent}</p>
                      <p className="text-zinc-400 text-sm mt-1">{teamSoS.biggestGame.narrative}</p>
                    </div>
                  )}
                  <p className="text-zinc-300 mt-2">{teamSoS.analysis}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">Strength of Schedule not yet available for this week.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 p-4 sm:p-6 lg:p-8">
      {/*
        NOTE: Tailwind CSS CDN and Inter font link have been moved to public/index.html
        for proper loading in a standard React development environment.
      */}
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0c0c0d; /* Even darker background for a richer feel */
        }
        /* Custom scrollbar for horizontal navigation */
        .scroll-hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .scroll-hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
      `}</style>

      <div className="max-w-7xl mx-auto bg-zinc-900 rounded-3xl shadow-2xl shadow-purple-950/30 overflow-hidden">
        {/* Header Section */}
        <header className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 sm:p-8 text-center rounded-t-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-lg">
            Rex Grossman Championship S League 🏆
          </h1>
          <p className="text-purple-200 text-lg sm:text-xl font-light">Your Weekly Fantasy Football Insight Stream</p>
        </header>

        {/* Weekly Genres / Navigation */}
        <nav className="bg-zinc-800 py-4 shadow-inner shadow-zinc-950/50">
          <div className="flex overflow-x-auto scroll-hide-scrollbar px-4 pb-2">
            {weeksData.map((week) => (
              <div
                key={week.id}
                className={`flex-shrink-0 w-48 mx-2 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 transform
                  ${activeWeek.id === week.id ? 'scale-105 ring-4 ring-purple-600 shadow-xl shadow-purple-900/50' : 'hover:scale-102 hover:shadow-lg hover:shadow-zinc-700/50'}
                  bg-zinc-700 hover:bg-zinc-600`}
                onClick={() => {
                  setActiveWeek(week);
                  setActiveInsightSection('powerRankings'); // Reset to power rankings when changing week
                }}
              >
                <img src={week.image} alt={week.title} className="w-full h-28 object-cover rounded-t-xl" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e2a4a/ffffff?text=Football+Insight'; }} />
                <div className="p-3">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{week.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2">{week.description}</p>
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="p-6 sm:p-8 lg:p-10 bg-zinc-900">
          <h2 className="text-4xl font-extrabold text-white mb-6 text-center drop-shadow-md">{activeWeek.title}</h2>
          <p className="text-lg text-zinc-300 mb-8 text-center font-light">{activeWeek.description}</p>

          {/* Inner Navigation Tabs for Insights */}
          <nav className="mb-8 bg-zinc-800 rounded-2xl p-3 shadow-xl shadow-zinc-950/50">
            <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setActiveInsightSection('powerRankings')}
                className={`px-5 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105
                  ${activeInsightSection === 'powerRankings'
                    ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50'
                    : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}
                `}
              >
                Power Rankings
              </button>
              <button
                onClick={() => setActiveInsightSection('stealsOverpays')}
                className={`px-5 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105
                  ${activeInsightSection === 'stealsOverpays'
                    ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50'
                    : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}
                `}
              >
                Steals & Overpays
              </button>
              <button
                onClick={() => setActiveInsightSection('strengthOfSchedule')}
                className={`px-5 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105
                  ${activeInsightSection === 'strengthOfSchedule'
                    ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50'
                    : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}
                `}
              >
                Strength of Schedule
              </button>
            </div>
          </nav>

          {renderInsightContent()}
        </main>

        {/* Footer */}
        <footer className="bg-zinc-950 text-zinc-500 text-center p-4 rounded-b-3xl text-sm font-light">
          <p>&copy; 2025 Rex Grossman Championship S League Insights. All rights reserved. (Probably not.)</p>
        </footer>
      </div>
    </div>
  );
};

export default App;