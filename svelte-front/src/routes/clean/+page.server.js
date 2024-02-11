export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
        cookies.set('user', data.get('user'), { path: '/' });

	}
};

export function load({ cookies }) {
	const user = cookies.get('user');

	return {
		user: user
	};
}