'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert('cities', [
      {
        name: 'Calgary',
        code: 'calgary',
        provinceId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Edmonton',
        code: 'edmonton',
        provinceId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Lethbridge',
        code: 'lethbridge',
        provinceId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Red Deer',
        code: 'red-deer',
        provinceId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Comox Vallery',
        code: 'comox-vallery',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Fraser Vallery',
        code: 'fraser-vallery',
        provinceId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Kamloops',
        code: 'kamloops',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Kelowna',
        code: 'kelowna',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Kootenays',
        code: 'kootenays',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Nanaimo',
        code: 'Nanaimo',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Prince George',
        code: 'prince-george',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Vancouver',
        code: 'vancouver',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Victoria',
        code: 'victoria',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Whistler',
        code: 'whistler',
        provinceId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Winnipeg',
        code: 'winnipeg',
        provinceId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Fredericton',
        code: 'fredericton',
        provinceId: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: `St. John’s`,
        code: 'st-johns',
        provinceId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Yellowknife',
        code: 'yellowknife',
        provinceId: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Halifax',
        code: 'halifax',
        provinceId: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Iqaluit',
        code: 'iqaluit',
        provinceId: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Barrie',
        code: 'barrie',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Hamilton',
        code: 'hamilton',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Kitchener',
        code: 'kitchener',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'London',
        code: 'london',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Niagara',
        code: 'niagara',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Ottawa',
        code: 'ottawa',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Sudbury',
        code: 'sudbury',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Thunder Bay',
        code: 'thunder-bay',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Toronto',
        code: 'toronto',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Kingston',
        code: 'kingston',
        provinceId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Charlottetown',
        code: 'charlottetown',
        provinceId: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Montreal',
        code: 'montreal',
        provinceId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Quebec City',
        code: 'quebec-city',
        provinceId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Sherbrooke',
        code: 'sherbrooke',
        provinceId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Trois-Rivieres',
        code: 'trois-Rivieres',
        provinceId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Saskatoon',
        code: 'saskatoon',
        provinceId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Regina',
        code: 'Regina',
        provinceId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name: 'Whitehorse',
        code: 'Whitehorse',
        provinceId: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('cities', null, {});
     */
  }
};