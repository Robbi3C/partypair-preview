/* Posts for the Instagram section (js/insta-grid.js): the
   latest 10 from @partypairdecorations, newest first. Media is saved in
   assets/img/insta because Instagram's own links expire and its embeds
   can't autoplay. Nothing here updates by itself.

   post     public URL
   image    cover (carousel tile; video poster), 9:16
   caption  short line shown on hover
   text     the post's caption, shown in the viewer
   alt      describes the cover

   Optional instead of video:
   slides   number of images in a carousel post: <code>-1.jpg … <code>-n.jpg
   watch    a reel with no saved video: the viewer links out instead */

const base = 'https://www.instagram.com/partypairdecorations';
const dir = 'assets/img/insta';

export const tiles = [
  { post: `${base}/reel/DfMpvQ9RGsc/`, image: `${dir}/DfMpvQ9RGsc.jpg`, video: `${dir}/DfMpvQ9RGsc.mp4`,
    caption: "Last Toast On The East Coast",
    alt: "Bedroom decorated with blue and white balloons around the bed and a tall mirror",
    text: "✨🤍🌊🥂💍\nLast Toast On The East Coast" },
  { post: `${base}/reel/DfAjtWYR1DE/`, image: `${dir}/DfAjtWYR1DE.jpg`, video: `${dir}/DfAjtWYR1DE.mp4`,
    caption: "It’s not just about the balloons, the banners, or the perfectly decorated room",
    alt: "Bride in a long veil, seen from behind on the beach under a blue sky",
    text: "It’s not just about the balloons, the banners, or the perfectly decorated room.\n\nIt’s about the moment she walks in and realizes her girls went out of their way to make her feel special. The thought, the effort, the little details that were all for her.\n\nBecause years from now, she might not remember every detail of the weekend, but she’ll remember how it felt to be celebrated by her favorite people. 🤍\n\nSend this to the maid of honor who’s making it all happen. 💌" },
  { post: `${base}/reel/De5BfMmRvMp/`, image: `${dir}/De5BfMmRvMp.jpg`, video: `${dir}/De5BfMmRvMp.mp4`,
    caption: "We’re convinced the brides choosing Cape Cod for their bachelorette weekends are onto something",
    alt: "Bride in a veil raising her arms in front of a window looking out to the water",
    text: "We’re convinced the brides choosing Cape Cod for their bachelorette weekends are onto something.\n\nOceanfront Airbnbs, slow mornings overlooking the Atlantic, espresso martinis with the girls, fresh hydrangeas and an itinerary that actually leaves room to relax.\n\nA little luxury, a little celebrating, and absolutely no spending the first few hours of your weekend blowing up balloons or decorating the house.\n\nBecause when you book a beautiful beachfront Airbnb for your bachelorette, imagine walking through the door to find the entire space already decorated, personalized and ready for the weekend you’ve been dreaming about.\n\nThat’s where we come in.\n\nWe’re The Party Pair, and we specialize in Cape Cod bachelorette decor, coastal Airbnb transformations and pre-arrival setups that make the weekend feel special from the moment you walk in.\n\nIf your dream bachelorette is equal parts coastal luxury, beautiful decor and actually getting to relax, follow @partypairdecorations. You’re exactly our kind of bride." },
  { post: `${base}/reel/DelAL5MxBdO/`, image: `${dir}/DelAL5MxBdO.jpg`, video: `${dir}/DelAL5MxBdO.mp4`,
    caption: "Just something about getting to surprise your best friend",
    alt: "Woman stepping through a blue tinsel curtain in a doorway",
    text: "just something about getting to surprise your best friend with a space that’s been decorated just for her.\n\nEspecially when you’ve spent months planning the bachelorette, coordinating with the girls, and making sure every little detail comes together.\n\nAnd when the moment finally comes? You should be standing right beside her, watching her surprise unfold. Not scrambling to finish decorating.\n\nThat’s where we come in.\n\nAt The Party Pair, we take care of your Cape Cod bachelorette decor before you arrive, so you can be part of the moment you’ve spent so much time planning.\n\nBecause at the end of the day, it’s not really about the balloons. It’s about making your girl feel loved, celebrated, and just a little extra special. 🤍" },
  { post: `${base}/reel/Debn14aRWdM/`, image: `${dir}/Debn14aRWdM.jpg`, video: `${dir}/Debn14aRWdM.mp4`,
    caption: "If your Pinterest board is full of Cape Cod bachelorette inspiration…",
    alt: "Table with a large cut-out of the groom’s face among white flowers, and a cut-out cat face",
    text: "If your Pinterest board is full of Cape Cod bachelorette inspiration, oceanfront Airbnbs, fresh hydrangeas, champagne towers and all the little personalized details… we have a feeling we’re going to get along.\n\nWe’re The Party Pair, a Cape Cod bachelorette decor and setup company specializing in turning your Pinterest boards into real-life bachelorette weekends.\n\nWe work with Maid of Honors, sisters and best friends who have a vision for celebrating their bride but don’t necessarily want to spend the first few hours of the weekend making it happen themselves.\n\nFrom decorating the Airbnb and styling the bride’s room to stocking the fridge and setting up welcome drinks, we handle the details before you even check in.\n\nBecause the best part of planning something this special should be getting to experience it, too.\n\nPlanning a Cape Cod bachelorette for 2027? Follow @partypairdecorations for coastal bachelorette inspiration, real Airbnb transformations and all the little details that make a weekend unforgettable.\n\nYou bring the vision. We’ll take it from there." },
  { post: `${base}/reel/DeX85Ixxiye/`, image: `${dir}/DeX85Ixxiye.jpg`, video: `${dir}/DeX85Ixxiye.mp4`,
    caption: "You spent months planning her bachelorette weekend",
    alt: "Kitchen island with white and gold balloons above it and shell bunting along the front",
    text: "You spent months planning her bachelorette weekend. You found the perfect Cape Cod Airbnb, coordinated everyone’s schedules, made the reservations and thought about all the little things that would make this weekend feel special.\n\nAnd after all of that… imagine being the one who gets to walk through the door and see everything come together for the first time, too.\n\nNot rushing to hang balloons before the bride arrives. Not asking the girls to help decorate after they’ve traveled all day. Not worrying about whether the Airbnb will look anything like the Pinterest board.\n\nJust walking in with your best friends, seeing the space completely transformed and knowing you pulled off something really special for someone you love.\n\nThat’s what we want for every Maid of Honor, sister and best friend who books with us.\n\nBecause you’re not just planning a Cape Cod bachelorette. You’re creating one of those weekends you’ll all talk about for years.\n\nYou take care of getting everyone together. We’ll take care of making it feel unforgettable.\n\n2027 Cape Cod bachelorette planning? This is the part we’d take off your plate first." },
  { post: `${base}/reel/DeU9137RW-q/`, image: `${dir}/DeU9137RW-q.jpg`, video: `${dir}/DeU9137RW-q.mp4`,
    caption: "Some girls want Vegas",
    alt: "Bedroom with white balloons floating above a bed, by a window",
    text: "Some girls want Vegas. Some girls want a bridal suite overlooking the Atlantic Ocean, slow mornings with their best friends, champagne with a view and absolutely nowhere to rush off to.\n\nAnd honestly, we get it.\n\nThere’s something about a Cape Cod bachelorette weekend that just feels different. The coastal charm, the oceanfront Airbnbs, the fresh hydrangeas and all the little details that make a girls’ weekend feel extra special.\n\nWhether you’re planning a full bachelorette itinerary or leaning into the whole relaxorette era, consider this your sign to put Cape Cod on the Pinterest board.\n\nSend this to the group chat. This could be your view next summer." },
  { post: `${base}/reel/DeU7J0_R4rd/`, image: `${dir}/DeU7J0_R4rd.jpg`, video: `${dir}/DeU7J0_R4rd.mp4`,
    caption: "Some girls want a bridal suite overlooking the Atlantic",
    alt: "View along a hallway and through a black door into a bright bedroom",
    text: "Some girls want Vegas. Some girls want a bridal suite overlooking the Atlantic Ocean, slow mornings with their best friends, champagne with a view and absolutely nowhere to rush off to.\n\nAnd honestly, we get it.\n\nThere’s something about a Cape Cod bachelorette weekend that just feels different. The coastal charm, the oceanfront Airbnbs, the fresh hydrangeas and all the little details that make a girls’ weekend feel extra special.\n\nWhether you’re planning a full bachelorette itinerary or leaning into the whole relaxorette era, consider this your sign to put Cape Cod on the Pinterest board.\n\nSend this to the group chat. This could be your view next summer." },
  { post: `${base}/reel/DcL5TjaxFWi/`, image: `${dir}/DcL5TjaxFWi.jpg`, video: `${dir}/DcL5TjaxFWi.mp4`,
    caption: "The behind the scenes → the text message we strive for every time",
    alt: "Living room with blue letter balloons and a customer’s text message praising the decorations",
    text: "The behind the scenes → the text message we strive for every time. 🥹🤍\n\nYou give us the vision, we handle the decorating, stocking + all the little details before check-in.\nThis is what a Cape Cod bachelorette with The Party Pair looks like behind the scenes. 🍐🎉💗" },
  { post: `${base}/reel/Db9dkjKx03X/`, image: `${dir}/Db9dkjKx03X.jpg`, video: `${dir}/Db9dkjKx03X.mp4`,
    caption: "We love to see it",
    alt: "Woman with her hand over her mouth in surprise as she walks into a room",
    text: "we love to see it ✨" },
];
