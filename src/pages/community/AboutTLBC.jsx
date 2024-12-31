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
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                About The Lord's Brethren Church International
              </h3>
            </div>

            <div className="p-6.5">
              {/* Introduction */}

              <div className="mb-8">
                <p className="text-lg mb-4 text-black dark:text-white text-justify">
                The Lord’s Brethren Church International (TLBC) is the church arm of the 
            Believers School of Faith Ministries, a vibrant community of believers who, 
            by faith, recognize themselves as brethren with Jesus Christ and share the 
            same Father as He. We are passionate about spreading the Good News of His 
            love to people across the world.
 
            Our vision is to call men and women by the Gospel of Jesus Christ into the 
            Glory of God, as we take the word of faith to peoples and nations of the world, 
            accompanied by the demonstration of the Holy Spirit.

            At TLBC, the Word of God is Lord. We do not accept as doctrine or practice anything 
            that is not firmly rooted in the teachings of Scripture. We believe that the Christian 
            faith is both historical and apostolic, which means we do not innovate in ways that 
            introduce doctrines or practices not taught or exemplified by the Apostles.
                </p>

                <p className="mb-6 text-black dark:text-white text-lg">
                <div className='font-semibold'>Our Vision: </div>
                <div className='mb-4'>
                To take the word of Faith to the nations of the world and to
                call men by the Gospel into the glory of God.
                
                  </div>

                <div className='font-semibold text-lg'>Our Mission:</div>
                1. Win sinners to Christ. <br />
                  2. Build saints in Christ. <br />
                  3. Make every saint a minister of the Lord Jesus Christ.
                </p>
              </div>


              <div className="mb-8">
                <p className="text-lg mb-4 text-black dark:text-white text-justify">
                  TLBC Int'l has expressions across various locations in Nigeria.
                  Our locations include: Awka, Nnewi, Ihiala, Ekwulobia, Onitsha, Oko, Owerri, Nekede.
                </p>

                <p className=" text-lg mb-6 text-black dark:text-white text-justify">
                  We also have our campus churches at: Nnamdi Azikiwe University
                  Awka, Chukwuemeka Odumegwu Ojukwu (COOU) Uli and Igbariam campuses, Anambra
                  State Polytechnic (ANSPOLY) Mgbakwu, Federal Polytechnic Nekede,
                  Federal Polytechnic Oko, Federal University of Technology Owerri,
                  Nnamdi Azikiwe University, College of Health Sciences UNIZIK,
                  Okofia Nnewi and University of Lagos.
                </p>
              </div>

              {/* Locations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Awka Zone */}
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Awka Zone
                  </h4>
                  <p className="text-black dark:text-white">
                    The Lord's Brethren Place, <br />
                    3 Uche Ekwunife Crescent, Awka, <br />
                    Anambra State.
                  </p>
                </div>

                {/* Nnewi Zone */}
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Nnewi Zone
                  </h4>
                  <p className="text-black dark:text-white">
                    The Lord's Brethren Place, <br />
                    31 Oraifite Road, Uruagu Nnewi <br />
                    (By Nwanyị Imo Bus Stop, 2nd Floor, <br />
                    Fidelity Bank Building), Anambra State.
                  </p>
                </div>

                {/* Ekwulobia Zone */}
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Ekwulobia Zone
                  </h4>
                  <p className="text-black dark:text-white">
                    The Lord's Brethren Place, <br />
                    Old NEPA Office, near Oko Roundabout, <br />
                    Oko, Anambra State.
                  </p>
                </div>

                {/* Owerri Zone */}
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    TLBC Int'l Owerri Zone
                  </h4>
                  <p className="text-black dark:text-white">
                    The Lord's Brethren Place, <br />
                    Umunnamaenyi Road (opposite Drink Depot), <br />
                    Ihiala, Anambra State.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <a
                    href="mailto:info@thelordsbrethrenchurch.org"
                    className="block text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80"
                  >
                    info@thelordsbrethrenchurch.org
                  </a>
                  <a
                    href="tel:+2349134445037"
                    className="block text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80"
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