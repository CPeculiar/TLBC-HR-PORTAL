import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const AboutTLBC = () => {
  return (
    <>
      <Breadcrumb pageName="About TLBC" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto">
          {/* Main Card */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-4 md:px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
                About The Lord's Brethren Church International
              </h3>
            </div>

            <div className="p-4 md:p-6.5">
              {/* Introduction */}

              <div className="mb-8">
                <p className="text-base md:text-lg mb-4 text-black dark:text-white text-justify break-words">
                The Lord’s Brethren Church International (TLBC) is the church arm of the 
            Believers School of Faith Ministries, a vibrant community of believers who, 
            by faith, recognize themselves as brethren with Jesus Christ and share the 
            same Father as He. We are passionate about spreading the Good News of His 
            love to people across the world.
            </p>
 
            <p className="text-base md:text-lg mb-4 text-black dark:text-white text-justify break-words">
            Our vision is to call men and women by the Gospel of Jesus Christ into the 
            Glory of God, as we take the word of faith to peoples and nations of the world, 
            accompanied by the demonstration of the Holy Spirit.
            </p>

            <p className="text-base md:text-lg mb-4 text-black dark:text-white text-justify break-words">
            At TLBC, the Word of God is Lord. We do not accept as doctrine or practice anything 
            that is not firmly rooted in the teachings of Scripture. We believe that the Christian 
            faith is both historical and apostolic, which means we do not innovate in ways that 
            introduce doctrines or practices not taught or exemplified by the Apostles.
           </p>

                <div className="mb-6 text-black dark:text-white text-base md:text-lg">
                <div className='font-semibold mb-2'>Our Vision: </div>
                <div className='mb-4 break-words'>
                To take the word of Faith to the nations of the world and to
                call men by the Gospel into the glory of God.
                
                  </div>

                <div className='font-semibold mb-2'>Our Mission:</div>
                <ol className="list-decimal pl-5 break-words">
                  <li>Win sinners to Christ.</li>
                  <li>Build saints in Christ.</li>
                  <li>Make every saint a minister of the Lord Jesus Christ.</li>
                </ol>
                </div>
              </div>


              <div className="mb-8">
                <p className="text-base md:text-lg mb-4 text-black dark:text-white text-justify break-words">
                  TLBC Int'l has expressions across various locations in Nigeria.
                  Our locations include: Awka, Nnewi, Ihiala, Ekwulobia, Onitsha, Oko, Owerri, Nekede.
                </p>

                <p className=" text-base md:text-lg mb-6 text-black dark:text-white text-justify break-words">
                  We also have our campus churches at: Nnamdi Azikiwe University
                  Awka, Chukwuemeka Odumegwu Ojukwu (COOU) Uli and Igbariam campuses, Anambra
                  State Polytechnic (ANSPOLY) Mgbakwu, Federal Polytechnic Nekede,
                  Federal Polytechnic Oko, Federal University of Technology Owerri,
                  Nnamdi Azikiwe University, College of Health Sciences UNIZIK,
                  Okofia Nnewi and University of Lagos.
                </p>
              </div>

              {/* Locations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Awka Zone */}
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-3 text-lg md:text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Awka Zone
                  </h4>
                  <p className="text-black dark:text-white break-words">
                    The Lord's Brethren Place, <br />
                    3 Uche Ekwunife Crescent, Awka, <br />
                    Anambra State.
                  </p>

                  <div className="mt-3 font-semibold text-black dark:text-white">
                  <div className="mb-1">Zonal Contact Information</div>
                <a
                    href="tel:+2347035913268"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 break-words"
                  >
                    Phone: +234 703-591-3268
                  </a>
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 overflow-hidden text-ellipsis break-words"
                  >
                    info@thelordsbrethrenchurch.org
                  </a>
               
                </div>
              
                </div>

                {/* Nnewi Zone */}
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-3 text-lg md:text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Nnewi Zone
                  </h4>
                  <p className="text-black dark:text-white break-words">
                    The Lord's Brethren Place, <br />
                    31 Oraifite Road, Uruagu Nnewi <br />
                    (By Nwanyị Imo Bus Stop, 2nd Floor, <br />
                    Fidelity Bank Building), Anambra State.
                  </p>

                  <div className="mt-3 font-semibold text-black dark:text-white">
                    <div className="mb-1">Zonal Contact Information</div>
                <a
                    href="tel:+2347062148857"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 break-words"
                    >
                    Phone: +234 706-214-8857
                  </a>
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 overflow-hidden text-ellipsis break-words"
                    >
                    info@thelordsbrethrenchurch.org
                  </a>
               
                </div>
                </div>

                {/* Ekwulobia Zone */}
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-3 text-lg md:text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Ekwulobia Zone
                  </h4>
                  <p className="text-black dark:text-white break-words">
                    The Lord's Brethren Place, <br />
                    Old NEPA Office, near Oko Roundabout, <br />
                    Oko, Anambra State.
                  </p>

                  <div className="mt-3 font-semibold text-black dark:text-white">
                    <div className="mb-1">Zonal Contact Information</div>
                <a
                    href="tel:+2348064430141"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 break-words"
                    >
                    Phone: +234 806-443-0141
                  </a>
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 overflow-hidden text-ellipsis break-words"
                    >
                    info@thelordsbrethrenchurch.org
                  </a>
               
                </div>
                </div>

                {/* Owerri Zone */}
                <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-3 text-lg md:text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Owerri Zone
                  </h4>
                  <p className="text-black dark:text-white break-words">
                    The Lord's Brethren Place, <br />
                    Umunnamaenyi Road (opposite Drink Depot), <br />
                    Ihiala, Anambra State.
                  </p>

                  <div className="mt-3 font-semibold text-black dark:text-white">
                  <div className="mb-1">Zonal Contact Information</div>
                <a
                    href="tel:+2348167353945"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 break-words"
                    >
                    Phone: +234 816-735-3945
                  </a>
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-primary dark:hover:text-white/80 overflow-hidden text-ellipsis break-words"
                    >
                    info@thelordsbrethrenchurch.org
                  </a>
               
                </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h4 className="mb-3 text-lg md:text-xl font-semibold text-black dark:text-white">
                  TLBC Contact Information
                </h4>
                <div className="space-y-2 font-semibold">
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80 overflow-hidden text-ellipsis break-words"
                  >
                    info@thelordsbrethrenchurch.org
                  </a>
                  <a
                    href="tel:+2349134445037"
                    className="block text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80 break-words"
                  >
                    Phone: +234 913-444-5037
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutTLBC;