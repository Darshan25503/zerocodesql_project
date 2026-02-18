// navData.ts

export const navItems = [
    {
        label: 'Home',
        href: '/',
    },
    {
        label: 'About',
        href: '/about',
        subMenu: [
            {
                label: 'Service 1',
                href: '/services/service1',
            },
            {
                label: 'Service 2',
                href: '/services/service2',
                subMenu: [
                    {
                        label: 'Sub Service A',
                        href: '/services/service2/subserviceA',
                    },
                    {
                        label: 'Sub Service B',
                        href: '/services/service2/subserviceB',
                    },
                ],
            },
        ],
    },
    {
        label: 'Services',
        href: '/services',
        subMenu: [
            {
                label: 'Service 1',
                href: '/services/service1',
            },
            {
                label: 'Service 2',
                href: '/services/service2',
                subMenu: [
                    {
                        label: 'Sub Service A',
                        href: '/services/service2/subserviceA',
                    },
                    {
                        label: 'Sub Service B',
                        href: '/services/service2/subserviceB',
                    },
                ],
            },
        ],
    },
    // Add more items as needed
];
